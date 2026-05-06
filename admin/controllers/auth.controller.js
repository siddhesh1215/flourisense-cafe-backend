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
 * Verify OTP
 */
module.exports.verifyOTP = async (request, response, next) => {
    try {
        const { userId, otp } = request.body;

        // Validate required fields
        if (!userId || !otp) {
            return response.status(400).json({
                status: false,
                message: "User ID and OTP are required",
                data: null,
            });
        }

        // Verify OTP
        const result = await verifyOTP(userId, otp);

        if (result.success) {
            // Update admin as verified
            await User.update(
                { is_verified: true, updated_on: new Date() },
                { where: { id: userId } }
            );

            return response.status(200).json({
                status: true,
                message: "Admin verified successfully",
                data: { userId },
            });
        } else {
            return response.status(400).json({
                status: false,
                message: result.message,
                data: null,
            });
        }
    } catch (e) {
        console.log(e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: null,
        });
    }
};

/**
 * Login admin and generate JWT token
 */
module.exports.login = async (request, response, next) => {
    try {
        const { email, password } = request.body;

        // Validate required fields
        if (!email || !password) {
            return response.status(400).json({
                status: false,
                message: "Email and password are required",
                data: null,
            });
        }

        // Normalize email to lowercase for case-insensitive search
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[ADMIN LOGIN] Attempting login with email: ${normalizedEmail}`);

        // Find admin by email (case-insensitive)
        const admin = await User.findOne({
            where: {
                email: normalizedEmail
            },
            include: [
                {
                    model: Reference,
                    as: 'role',
                    attributes: ['id', 'name', 'code']
                }
            ]
        });

        if (!admin) {
            console.log(`[ADMIN LOGIN] ❌ Admin not found with email: ${normalizedEmail}`);
            return response.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: {
                    adminFound: false,
                    hint: "No admin registered with this email address"
                },
            });
        }

        // Check if user is admin or super_admin
        const roleName = admin.role?.name?.toLowerCase();
        const isAllowed = roleName === 'admin' || roleName === 'super_admin';
        if (!isAllowed) {
            return response.status(403).json({
                status: false,
                message: "This account does not have admin access",
                data: {
                    role: admin.role?.name || 'user'
                },
            });
        }

        console.log(`[ADMIN LOGIN] ✅ Admin found: ${admin.id} (${admin.email})`);
        console.log(`[ADMIN LOGIN] Admin verified status: ${admin.is_verified}`);

        // Check if admin is verified
        if (!admin.is_verified) {
            console.log(`[ADMIN LOGIN] Admin not verified: ${normalizedEmail}`);
            return response.status(403).json({
                status: false,
                message: "Email not verified. Please verify your email first.",
                data: {
                    adminId: admin.id,
                    email: admin.email,
                    verified: false,
                    needsOTP: true,
                    hint: "Use /verify-otp endpoint with OTP sent to your email"
                },
            });
        }

        // Verify password using bcrypt
        console.log(`[ADMIN LOGIN] Verifying password...`);

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        console.log(`[ADMIN LOGIN] Password verification result: ${isPasswordValid}`);

        if (!isPasswordValid) {
            console.log(`[ADMIN LOGIN] ❌ Invalid password for admin: ${normalizedEmail}`);
            return response.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: {
                    adminFound: true,
                    passwordValid: false,
                    hint: "Email found but password is incorrect"
                },
            });
        }

        console.log(`[ADMIN LOGIN] ✅ Password valid. Generating JWT token...`);

        // Generate JWT token — include role name for fast middleware checks
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

        console.log(`[ADMIN LOGIN] ✅ JWT token generated successfully for admin: ${admin.id}`);

        return response.status(200).json({
            status: true,
            message: "Admin login successful",
            data: {
                adminId: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role?.name || 'admin',
                token: token,
                expiresIn: '24h'
            },
        });
    } catch (e) {
        console.error('[ADMIN LOGIN ERROR]', e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: {
                error: e.message,
            },
        });
    }
};
