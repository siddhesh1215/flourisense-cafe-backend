const { User, Reference } = require('../../models');
const { createAndSendOTP, verifyOTP } = require('../../services/otpService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

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
