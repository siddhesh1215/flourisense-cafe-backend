const { User } = require('../../models');
const { createAndSendOTP, verifyOTP } = require('../../services/otpService');
const bcrypt = require('bcrypt');

/**
 * Register a new user
 */
module.exports.register = async (request, response, next) => {
    try {
        const { name, email, phone, password } = request.body;

        // Validate required fields
        if (!name || !email || !password) {
            return response.status(400).json({
                status: false,
                message: "Name, email, and password are required",
                data: null,
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return response.status(400).json({
                status: false,
                message: "User with this email already exists",
                data: null,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            is_verified: false,
            created_on: new Date(),
            updated_on: new Date(),
        });

        // Send OTP to email
        const otpResult = await createAndSendOTP(user.id, email, name);

        if (otpResult.success) {
            return response.status(201).json({
                status: true,
                message: "User registered successfully. OTP sent to your email.",
                data: {
                    userId: user.id,
                    email: user.email,
                    otpExpiresIn: `${otpResult.expiresIn} minutes`,
                },
            });
        } else {
            // Delete user if OTP sending failed
            await User.destroy({ where: { id: user.id } });
            return response.status(500).json({
                status: false,
                message: otpResult.message,
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
            // Update user as verified
            await User.update(
                { is_verified: true, updated_on: new Date() },
                { where: { id: userId } }
            );

            return response.status(200).json({
                status: true,
                message: "User verified successfully",
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
