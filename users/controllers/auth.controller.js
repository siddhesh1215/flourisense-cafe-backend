const { User } = require('../../models');
const { createAndSendOTP, verifyOTP, resendOTP: resendOTPService } = require('../../services/otpService');
const { getRoleIdByName } = require('../../utils/roleHelper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^\d{10}$/.test(phone);

module.exports.register = async (request, response, next) => {
    try {
        const { name, email, phone, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({
                status: false,
                message: "Name, email, and password are required",
                data: null,
            });
        }

        if (!isValidEmail(email)) {
            return response.status(400).json({
                status: false,
                message: "Invalid email address",
                data: null,
            });
        }

        if (phone && !isValidPhone(phone)) {
            return response.status(400).json({
                status: false,
                message: "Phone number must be exactly 10 digits",
                data: null,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ where: { email: normalizedEmail } });

        if (existingUser && existingUser.is_verified) {
            return response.status(400).json({
                status: false,
                message: "User with this email already exists",
                data: null,
            });
        }

        const roleId = await getRoleIdByName('user');
        if (!roleId) {
            return response.status(500).json({
                status: false,
                message: "User role not configured in database",
                data: null,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        let user;

        if (existingUser) {
            await existingUser.update({
                name,
                phone,
                password: hashedPassword,
                role_id: roleId,
                updated_on: new Date(),
            });
            user = existingUser;
        } else {
            user = await User.create({
                name,
                email: normalizedEmail,
                phone,
                password: hashedPassword,
                role_id: roleId,
                is_verified: false,
                created_on: new Date(),
                updated_on: new Date(),
            });
        }

        createAndSendOTP(user.id, normalizedEmail, name)
            .then(() => {
                console.log(`[REGISTER] OTP sent to ${normalizedEmail}`);
            })
            .catch((err) => {
                console.error(`[REGISTER] OTP send failed for ${normalizedEmail}`, err);
            });

        return response.status(201).json({
            status: true,
            message: "Please check your email for the OTP.",
            data: {
                userId: user.id,
                email: user.email,
            },
        });

    } catch (e) {
        if (e.name === 'SequelizeValidationError') {
            return response.status(400).json({
                status: false,
                message: e.errors?.[0]?.message || "Validation failed",
                data: null,
            });
        }
        console.error('[REGISTER ERROR]', e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: null,
        });
    }
};

module.exports.verifyOTP = async (request, response, next) => {
    try {
        const { userId, otp } = request.body;

        if (!userId || !otp) {
            return response.status(400).json({
                status: false,
                message: "User ID and OTP are required",
                data: null,
            });
        }

        const result = await verifyOTP(userId, otp);

        if (result.success) {
            await User.update(
                { is_verified: true, updated_on: new Date() },
                { where: { id: userId } }
            );

            return response.status(200).json({
                status: true,
                message: "User registered and verified successfully",
                data: { userId },
            });
        }

        return response.status(400).json({
            status: false,
            message: result.message,
            data: null,
        });
    } catch (e) {
        console.error('[VERIFY OTP ERROR]', e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: null,
        });
    }
};

module.exports.login = async (request, response, next) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                status: false,
                message: "Email and password are required",
                data: null,
            });
        }

        if (!isValidEmail(email)) {
            return response.status(400).json({
                status: false,
                message: "Invalid email address",
                data: null,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ where: { email: normalizedEmail } });

        if (!user) {
            return response.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: null,
            });
        }

        if (!user.is_verified) {
            return response.status(403).json({
                status: false,
                message: "Email not verified. Please verify your email first.",
                data: {
                    userId: user.id,
                    email: user.email,
                    verified: false,
                    needsOTP: true,
                },
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return response.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: null,
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            config.JWT_AUTH_TOKEN,
            { expiresIn: '24h' }
        );

        return response.status(200).json({
            status: true,
            message: "Login successful",
            data: {
                userId: user.id,
                email: user.email,
                name: user.name,
                role: 'user',
                role_id: user.role_id,
                token,
            },
        });
    } catch (e) {
        console.error('[LOGIN ERROR]', e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: null,
        });
    }
};

module.exports.resendOTP = async (request, response, next) => {
    try {
        const { userId, email } = request.body;

        if (!userId || !email) {
            return response.status(400).json({
                status: false,
                message: "userId and email are required",
                data: null,
            });
        }

        if (!isValidEmail(email)) {
            return response.status(400).json({
                status: false,
                message: "Invalid email address",
                data: null,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ where: { id: userId, email: normalizedEmail } });

        if (!user) {
            return response.status(404).json({
                status: false,
                message: "User not found",
                data: null,
            });
        }

        resendOTPService(userId, normalizedEmail, user.name)
            .then(() => {
                console.log(`[RESEND OTP] OTP sent to ${normalizedEmail}`);
            })
            .catch((err) => {
                console.error(`[RESEND OTP] Failed for ${normalizedEmail}`, err);
            });

        return response.status(200).json({
            status: true,
            message: "OTP sent. Check your email.",
            data: {
                userId,
                email: normalizedEmail,
            },
        });
    } catch (e) {
        console.error('[RESEND OTP ERROR]', e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: null,
        });
    }
};

// ─── GET /user/auth/me ────────────────────────────────────────────────────────
/**
 * Return the authenticated user's own profile.
 * Requires: verifyJWTToken middleware (sets req.user).
 */
module.exports.getProfile = async (request, response, next) => {
    try {
        const userId = request.user.id;

        const user = await User.findOne({
            where: { id: userId, inactive: false },
            attributes: ['id', 'name', 'email', 'phone', 'is_verified', 'created_on', 'updated_on'],
        });

        if (!user) {
            return response.status(404).json({
                status: false,
                message: 'User not found',
                data: null,
            });
        }

        return response.status(200).json({
            status: true,
            message: 'Profile fetched successfully',
            data: user,
        });
    } catch (e) {
        console.error('[GET PROFILE ERROR]', e);
        return response.status(500).json({
            status: false,
            message: 'Something went wrong. Please try again',
            data: null,
        });
    }
};

// ─── PUT /user/auth/profile ───────────────────────────────────────────────────
/**
 * Update the authenticated user's name and/or phone.
 * Email is NOT updatable here — it is the login credential and requires re-verification.
 * Requires: verifyJWTToken middleware.
 * Body: { name?, phone? }
 */
module.exports.updateProfile = async (request, response, next) => {
    try {
        const userId = request.user.id;
        const { name, phone } = request.body;

        if (!name && phone === undefined) {
            return response.status(400).json({
                status: false,
                message: 'Provide at least one field to update (name or phone)',
                data: null,
            });
        }

        const user = await User.findOne({ where: { id: userId, inactive: false } });

        if (!user) {
            return response.status(404).json({
                status: false,
                message: 'User not found',
                data: null,
            });
        }

        const updates = { updated_on: new Date() };
        if (name)                updates.name  = name.trim();
        if (phone !== undefined) updates.phone = phone ? phone.trim() : null;

        await user.update(updates);

        return response.status(200).json({
            status: true,
            message: 'Profile updated successfully',
            data: {
                id:         user.id,
                name:       user.name,
                email:      user.email,
                phone:      user.phone,
                updated_on: user.updated_on,
            },
        });
    } catch (e) {
        if (e.name === 'SequelizeValidationError') {
            return response.status(400).json({
                status: false,
                message: e.errors?.[0]?.message || 'Validation failed',
                data: null,
            });
        }
        console.error('[UPDATE PROFILE ERROR]', e);
        return response.status(500).json({
            status: false,
            message: 'Something went wrong. Please try again',
            data: null,
        });
    }
};

// ─── PUT /user/auth/change-password ──────────────────────────────────────────
/**
 * Change the authenticated user's password.
 * Requires: verifyJWTToken middleware.
 * Body: { current_password, new_password, confirm_password }
 */
module.exports.changePassword = async (request, response, next) => {
    try {
        const userId = request.user.id;
        const { current_password, new_password } = request.body;

        const user = await User.findOne({ where: { id: userId, inactive: false } });

        if (!user) {
            return response.status(404).json({
                status: false,
                message: 'User not found',
                data: null,
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return response.status(400).json({
                status: false,
                message: 'Current password is incorrect',
                data: null,
            });
        }

        // Prevent reuse of the same password
        const isSame = await bcrypt.compare(new_password, user.password);
        if (isSame) {
            return response.status(400).json({
                status: false,
                message: 'New password must be different from your current password',
                data: null,
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 8);
        await user.update({ password: hashedPassword, updated_on: new Date() });

        return response.status(200).json({
            status: true,
            message: 'Password changed successfully',
            data: null,
        });
    } catch (e) {
        console.error('[CHANGE PASSWORD ERROR]', e);
        return response.status(500).json({
            status: false,
            message: 'Something went wrong. Please try again',
            data: null,
        });
    }
};
