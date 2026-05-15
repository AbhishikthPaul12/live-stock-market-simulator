import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a professional OTP email for password reset
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"StockSim Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - Verification Code",
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #f1f5f9;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 56px; height: 56px; background-color: #4f46e5; border-radius: 16px; margin-bottom: 16px;">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="padding: 14px;">
                <path d="M12 15V17M12 7V11M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.025em; text-transform: uppercase;">Verification Code</h1>
          </div>
          
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6; text-align: center;">
            You requested to reset your password. Use the code below to verify your identity.
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 20px; padding: 32px; text-align: center; border: 2px dashed #e2e8f0; margin-bottom: 24px;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #4f46e5;">${otp}</span>
          </div>
          
          <p style="margin: 0 0 32px 0; font-size: 14px; color: #9ca3af; text-align: center;">
            This code expires in <span style="color: #ef4444; font-weight: 700;">5 minutes</span>. If you didn't request this, you can ignore this email.
          </p>
          
          <div style="border-top: 1px solid #f1f5f9; padding-top: 32px; text-align: center;">
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase;">StockSim AI Trading Terminal</p>
          </div>
        </div>
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
          &copy; 2026 StockSim Simulator. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("EMAIL_SERVICE_ERROR:", error.message);
    throw new Error("SMTP Error: Failed to send email.");
  }
};
