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
    console.log(`[OTP] Starting OTP generation for user ${userId} (${email})`);
    
    // Generate OTP
    const otpCode = generateOTP();
    console.log(`[OTP] Generated OTP code: ${otpCode}`);

    // Calculate expiry time
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
    console.log(`[OTP] OTP expires at: ${expiryTime}`);

    // Save OTP to database
    const otpRecord = await OTP.create({
      user_id: userId,
      otp_code: otpCode,
      expires_at: expiryTime,
      created_on: new Date(),
      updated_on: new Date(),
    });
    console.log(`[OTP] OTP saved to database with ID: ${otpRecord.id}`);

    // Send OTP via email
    console.log(`[OTP] Sending OTP email to ${email}...`);
    const emailResult = await sendOTPEmail(email, otpCode, userName);
    console.log(`[OTP] Email send result:`, emailResult);

    if (emailResult.success) {
      console.log(`[OTP] ✅ OTP sent successfully to ${email}`);
      return {
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: expiryMinutes,
        testOTP: otpCode, // For development testing only
      };
    } else {
      console.log(`[OTP] ❌ Email sending failed. Deleting OTP record.`);
      // Delete the OTP record if email failed
      await OTP.destroy({
        where: { user_id: userId, otp_code: otpCode }
      });
      
      return {
        success: false,
        message: `Failed to send OTP: ${emailResult.error}`,
        error: emailResult.error,
      };
    }
  } catch (error) {
    console.error('[OTP] ❌ Error creating OTP:', error.message);
    console.error('[OTP] Full error:', error);
    return {
      success: false,
      message: 'Error creating OTP: ' + error.message,
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
    if (new Date() > new Date(otpRecord.expires_at)) {
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
