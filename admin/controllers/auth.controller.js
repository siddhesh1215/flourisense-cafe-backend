const { User, Reference } = require('../../models');
const { createAndSendOTP, verifyOTP } = require('../../services/otpService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { success, notFound, badRequest, serverError } = require('../../utils/response.helper');

/**
 * Admin self-registration is disabled.
 * Admins are created by the Super Admin via POST /admin/super/admins
 */
module.exports.register = async (request, response) => {
    return response.status(403).json({
        status: false,
        message: "Admin self-registration is disabled. Contact your Super Admin to create an account.",
        data: null,
    });
};


/**
 * Verify OTP — used ONLY for first-time admin login verification.
 *
 * On success:
 *  - Marks admin as verified (is_verified: true)
 *  - Clears the first_login flag (first_login: false)
 *  - Issues a JWT token so the admin is immediately logged in
 */
module.exports.verifyOTP = async (request, response) => {
    try {
        const { userId, otp } = request.body;

        if (!userId || !otp) {
            return response.status(400).json({
                status: false,
                message: "User ID and OTP are required",
                data: null,
            });
        }

        // Fetch the admin to confirm they exist and are in first-login state
        const admin = await User.findOne({
            where: { id: userId },
            include: [{ model: Reference, as: 'role', attributes: ['id', 'name', 'code'] }],
        });

        if (!admin) {
            return response.status(404).json({
                status: false,
                message: "Admin not found",
                data: null,
            });
        }

        // Only allow OTP verification if first_login is still true
        if (!admin.first_login) {
            return response.status(400).json({
                status: false,
                message: "OTP verification is not required. Please log in directly.",
                data: null,
            });
        }

        // Verify OTP
        const result = await verifyOTP(userId, otp);

        if (!result.success) {
            return response.status(400).json({
                status: false,
                message: result.message,
                data: null,
            });
        }

        // Mark admin as verified and clear first_login flag
        await User.update(
            { is_verified: true, first_login: false, updated_on: new Date() },
            { where: { id: userId } }
        );

        console.log(`[ADMIN VERIFY OTP] ✅ Admin ${userId} verified successfully. first_login cleared.`);

        // Issue JWT token so admin is immediately logged in after verification
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role_id: admin.role_id,
                role: admin.role?.name || 'admin',
            },
            config.JWT_AUTH_TOKEN,
            { expiresIn: '24h' }
        );

        return response.status(200).json({
            status: true,
            message: "OTP verified successfully. Welcome!",
            data: {
                adminId: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role?.name || 'admin',
                token,
                expiresIn: '24h',
            },
        });
    } catch (e) {
        console.error('[ADMIN VERIFY OTP ERROR]', e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: null,
        });
    }
};

/**
 * Admin login
 *
 * Flow:
 *  - Super admin  → always gets a JWT token directly (no OTP).
 *  - Normal admin (first_login: true)  → password verified → OTP sent → respond with needsOTP.
 *  - Normal admin (first_login: false) → password verified → JWT token issued directly.
 */
module.exports.login = async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                status: false,
                message: "Email and password are required",
                data: null,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[ADMIN LOGIN] Attempting login with email: ${normalizedEmail}`);

        const admin = await User.findOne({
            where: { email: normalizedEmail },
            include: [{ model: Reference, as: 'role', attributes: ['id', 'name', 'code'] }],
        });

        if (!admin) {
            console.log(`[ADMIN LOGIN] ❌ Admin not found with email: ${normalizedEmail}`);
            return response.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: { adminFound: false },
            });
        }

        // Only admin and super_admin roles are allowed here
        const roleName = admin.role?.name?.toLowerCase();
        const isAllowed = roleName === 'admin' || roleName === 'super_admin';
        if (!isAllowed) {
            return response.status(403).json({
                status: false,
                message: "This account does not have admin access",
                data: { role: admin.role?.name || 'user' },
            });
        }

        console.log(`[ADMIN LOGIN] ✅ Admin found: ${admin.id} (${admin.email}) | role: ${roleName}`);

        // ── Verify password ──────────────────────────────────────────────────────
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            console.log(`[ADMIN LOGIN] ❌ Invalid password for: ${normalizedEmail}`);
            return response.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: { adminFound: true, passwordValid: false },
            });
        }

        // ── Super admin: skip OTP entirely ───────────────────────────────────────
        if (roleName === 'super_admin') {
            console.log(`[ADMIN LOGIN] Super admin detected — issuing token directly.`);
            const token = jwt.sign(
                { id: admin.id, email: admin.email, role_id: admin.role_id, role: roleName },
                config.JWT_AUTH_TOKEN,
                { expiresIn: '24h' }
            );
            return response.status(200).json({
                status: true,
                message: "Admin login successful",
                data: { adminId: admin.id, email: admin.email, name: admin.name, role: roleName, token, expiresIn: '24h' },
            });
        }

        // ── Normal admin: first login → send OTP ─────────────────────────────────
        if (admin.first_login) {
            console.log(`[ADMIN LOGIN] First login detected for admin ${admin.id} — sending OTP.`);

            const otpResult = await createAndSendOTP(admin.id, admin.email, admin.name, 5);

            if (!otpResult.success) {
                return response.status(500).json({
                    status: false,
                    message: "Failed to send OTP. Please try again.",
                    data: { error: otpResult.message },
                });
            }

            return response.status(200).json({
                status: true,
                message: "OTP sent to your registered email. Please verify to complete login.",
                data: {
                    adminId: admin.id,
                    email: admin.email,
                    needsOTP: true,
                    otpExpiresIn: `${otpResult.expiresIn} minutes`,
                },
            });
        }

        // ── Normal admin: subsequent logins → issue JWT directly ─────────────────
        console.log(`[ADMIN LOGIN] ✅ Returning admin — issuing JWT token directly.`);

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role_id: admin.role_id, role: roleName },
            config.JWT_AUTH_TOKEN,
            { expiresIn: '24h' }
        );

        return response.status(200).json({
            status: true,
            message: "Admin login successful",
            data: {
                adminId: admin.id,
                email: admin.email,
                name: admin.name,
                role: roleName,
                token,
                expiresIn: '24h',
            },
        });
    } catch (e) {
        console.error('[ADMIN LOGIN ERROR]', e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: { error: e.message },
        });
    }
};

// ─── GET /admin/auth/me ───────────────────────────────────────────────────────
/**
 * Return the authenticated admin's own profile.
 * Requires: verifyAdminToken middleware (sets req.user).
 */
module.exports.getProfile = async (req, res) => {
    try {
        const adminId = req.user?.id || req.auth?.id;

        const admin = await User.findOne({
            where: { id: adminId, inactive: false },
            attributes: ['id', 'name', 'email', 'phone', 'is_verified', 'created_on', 'updated_on'],
            include: [{ model: Reference, as: 'role', attributes: ['id', 'name', 'code'] }],
        });

        if (!admin) return notFound(res, 'Admin not found');

        return success(res, 'Profile fetched successfully', admin);
    } catch (e) {
        console.error('[ADMIN GET PROFILE ERROR]', e);
        return serverError(res, e);
    }
};

// ─── PUT /admin/auth/profile ──────────────────────────────────────────────────
/**
 * Update the authenticated admin's name and/or phone.
 * Email is NOT updatable here.
 * Requires: verifyAdminToken middleware.
 * Body: { name?, phone? }
 */
module.exports.updateProfile = async (req, res) => {
    try {
        const adminId = req.user?.id || req.auth?.id;
        const { name, phone } = req.body;

        if (!name && phone === undefined) {
            return badRequest(res, 'Provide at least one field to update (name or phone)');
        }

        const admin = await User.findOne({ where: { id: adminId, inactive: false } });
        if (!admin) return notFound(res, 'Admin not found');

        const updates = { updated_on: new Date() };
        if (name)                updates.name  = name.trim();
        if (phone !== undefined) updates.phone = phone ? phone.trim() : null;

        await admin.update(updates);

        return success(res, 'Profile updated successfully', {
            id:         admin.id,
            name:       admin.name,
            email:      admin.email,
            phone:      admin.phone,
            updated_on: admin.updated_on,
        });
    } catch (e) {
        if (e.name === 'SequelizeValidationError') {
            return badRequest(res, e.errors?.[0]?.message || 'Validation failed');
        }
        console.error('[ADMIN UPDATE PROFILE ERROR]', e);
        return serverError(res, e);
    }
};

// ─── PUT /admin/auth/change-password ─────────────────────────────────────────
/**
 * Change the authenticated admin's password.
 * Requires: verifyAdminToken middleware.
 * Body: { current_password, new_password, confirm_password }
 */
module.exports.changePassword = async (req, res) => {
    try {
        const adminId = req.user?.id || req.auth?.id;
        const { current_password, new_password } = req.body;

        const admin = await User.findOne({ where: { id: adminId, inactive: false } });
        if (!admin) return notFound(res, 'Admin not found');

        // Verify current password
        const isMatch = await bcrypt.compare(current_password, admin.password);
        if (!isMatch) {
            return badRequest(res, 'Current password is incorrect');
        }

        // Prevent reuse of the same password
        const isSame = await bcrypt.compare(new_password, admin.password);
        if (isSame) {
            return badRequest(res, 'New password must be different from your current password');
        }

        const hashedPassword = await bcrypt.hash(new_password, 8);
        await admin.update({ password: hashedPassword, updated_on: new Date() });

        return success(res, 'Password changed successfully', null);
    } catch (e) {
        console.error('[ADMIN CHANGE PASSWORD ERROR]', e);
        return serverError(res, e);
    }
};
