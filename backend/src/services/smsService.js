const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send OTP via SMS
 */
const sendOTPSMS = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your QuickCommerce verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('SMS sent successfully:', message.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

/**
 * Send Password Reset SMS
 */
const sendPasswordResetSMS = async (phone) => {
  try {
    const message = await client.messages.create({
      body: `QuickCommerce: A password reset was requested for your account. If you didn't request this, please contact support immediately.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('Password reset SMS sent:', message.sid);
    return true;
  } catch (error) {
    console.error('Error sending password reset SMS:', error);
    return false;
  }
};

module.exports = {
  sendOTPSMS,
  sendPasswordResetSMS
};
