const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Mail service error:', error);
  } else {
    console.log('Mail service is ready');
  }
});

/**
 * Send OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code
 * @param {string} userName - User's name
 */
const sendOTPEmail = async (email, otp, userName = 'User') => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Your OTP for Flourisense Cafe',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You requested a verification code to secure your Flourisense Cafe account.
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">Your OTP Code</p>
              <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0; letter-spacing: 5px;">${otp}</p>
            </div>
            <p style="color: #666; font-size: 14px;">
              <strong>This code will expire in 10 minutes.</strong> Do not share this code with anyone.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Flourisense Cafe. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.response);
    return {
      success: true,
      message: 'OTP sent successfully',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return {
      success: false,
      message: 'Failed to send OTP email',
      error: error.message,
    };
  }
};

/**
 * Send verification email
 * @param {string} email - Recipient email address
 * @param {string} verificationLink - Verification link
 */
const sendVerificationEmail = async (email, verificationLink, userName = 'User') => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Verify Your Flourisense Cafe Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Flourisense Cafe, ${userName}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Please verify your email address to complete your registration and start enjoying our services.
            </p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email Address
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              <span style="color: #0066cc; word-break: break-all;">${verificationLink}</span>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This link will expire in 24 hours.
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Flourisense Cafe. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.response);
    return {
      success: true,
      message: 'Verification email sent successfully',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: 'Failed to send verification email',
      error: error.message,
    };
  }
};

module.exports = {
  sendOTPEmail,
  sendVerificationEmail,
};
