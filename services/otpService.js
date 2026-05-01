const crypto = require('crypto');
const { OTP } = require('../models');
const { sendOTPEmail } = require('./mailerService');

/**
 * Generate a random OTP code
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} OTP code
 */
const generateOTP = (length = 6) => {
  return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
};

/**
 * Create and send OTP to user email
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {string} userName - User name
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 */
const createAndSendOTP = async (userId, email, userName = 'User', expiryMinutes = 10) => {
  try {
    // Generate OTP
    const otpCode = generateOTP();

    // Calculate expiry time
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);

    // Save OTP to database
    await OTP.create({
      user_id: userId,
      otp_code: otpCode,
      expireAt: expiryTime,
      created_on: new Date(),
      updated_on: new Date(),
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otpCode, userName);

    if (emailResult.success) {
      return {
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: expiryMinutes,
      };
    } else {
      // Delete the OTP record if email failed
      await OTP.destroy({
        where: { user_id: userId, otp_code: otpCode }
      });
      
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: emailResult.error,
      };
    }
  } catch (error) {
    console.error('Error creating OTP:', error);
    return {
      success: false,
      message: 'Error creating OTP',
      error: error.message,
    };
  }
};

/**
 * Verify OTP code
 * @param {number} userId - User ID
 * @param {string} otpCode - OTP code to verify
 */
const verifyOTP = async (userId, otpCode) => {
  try {
    const otpRecord = await OTP.findOne({
      where: { user_id: userId, otp_code: otpCode },
      order: [['created_on', 'DESC']],
    });

    if (!otpRecord) {
      return {
        success: false,
        message: 'Invalid OTP',
      };
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expireAt)) {
      return {
        success: false,
        message: 'OTP has expired',
      };
    }

    // Delete the OTP after successful verification
    await OTP.destroy({
      where: { id: otpRecord.id }
    });

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    };
  }
};

/**
 * Resend OTP to user email
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {string} userName - User name
 */
const resendOTP = async (userId, email, userName = 'User') => {
  try {
    // Delete previous OTPs for this user
    await OTP.destroy({
      where: { user_id: userId }
    });

    // Create and send new OTP
    return await createAndSendOTP(userId, email, userName);
  } catch (error) {
    console.error('Error resending OTP:', error);
    return {
      success: false,
      message: 'Error resending OTP',
      error: error.message,
    };
  }
};

module.exports = {
  generateOTP,
  createAndSendOTP,
  verifyOTP,
  resendOTP,
};
