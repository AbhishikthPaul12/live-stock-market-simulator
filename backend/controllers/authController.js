import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Portfolio from "../models/Portfolio.js";
import Alert from "../models/Alert.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail } from "../services/emailService.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      walletBalance: 100000, // default balance
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      walletBalance: user.walletBalance,
      realizedProfit: user.realizedProfit,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        realizedProfit: user.realizedProfit,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// PROFILE
export const getUserProfile = async (req, res) => {
  if (req.user) {
    try {
      // Calculate realized profit today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const transactionsToday = await Transaction.find({
        user: req.user._id,
        type: "SELL",
        createdAt: { $gte: startOfDay }
      });

      let realizedProfitToday = 0;
      for (let i = 0; i < transactionsToday.length; i++) {
          let profit = 0;
          if (transactionsToday[i].profit) {
              profit = transactionsToday[i].profit;
          }
          realizedProfitToday = realizedProfitToday + profit;
      }

      const userObj = req.user.toObject();
      userObj.realizedProfitToday = Number(realizedProfitToday.toFixed(6));

      res.json(userObj);
    } catch (error) {
      res.status(500).json({ message: "Error calculating daily stats" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// FORGOT PASSWORD - STEP 1: Generate & Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    if (user.isGuest) {
      return res.status(403).json({ message: "Password reset is disabled for the demo account." });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP & Expiry (5 minutes)
    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send Email
    try {
      await sendOTPEmail(user.email, otp);
      res.json({ message: "OTP sent to your email. Valid for 5 minutes." });
    } catch (emailError) {
      // If email fails, clear the OTP and return error
      user.resetOTP = undefined;
      user.resetOTPExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send email. Please try again later." });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP - STEP 2: Check if OTP is valid
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully", valid: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD - STEP 3: Update Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Verification failed. Please request a new OTP." });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    user.resetPasswordToken = undefined; // Cleanup old system fields if any
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now login with your new password." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESEND OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTPEmail(user.email, otp);
    res.json({ message: "A new OTP has been sent to your email." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GUEST LOGIN
export const guestLogin = async (req, res) => {
  try {
    let user = await User.findOne({ email: "guest@demo.com" });

    if (!user) {
      user = await User.create({
        name: "Demo Guest",
        email: "guest@demo.com",
        password: Math.random().toString(36).slice(-10), // random password
        isGuest: true,
        walletBalance: 100000,
      });
      
      // Seed some initial data for the guest if it's new
      await Portfolio.create([
        { user: user._id, symbol: "RELIANCE.NS", quantity: 10, buyPrice: 2500 },
        { user: user._id, symbol: "TCS.NS", quantity: 5, buyPrice: 3400 }
      ]);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      walletBalance: user.walletBalance,
      realizedProfit: user.realizedProfit,
      isGuest: user.isGuest,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET GUEST DATA
export const resetGuestData = async (req, res) => {
  try {
    if (!req.user || !req.user.isGuest) {
      return res.status(403).json({ message: "Only guest accounts can be reset." });
    }

    const userId = req.user._id;

    // Clear all activity
    await Promise.all([
      Portfolio.deleteMany({ user: userId }),
      Transaction.deleteMany({ user: userId }),
      Alert.deleteMany({ user: userId })
    ]);

    // Reset user stats
    req.user.walletBalance = 100000;
    req.user.realizedProfit = 0;
    await req.user.save();

    // Re-seed with fresh data
    await Portfolio.create([
      { user: userId, symbol: "RELIANCE.NS", quantity: 10, buyPrice: 2500 },
      { user: userId, symbol: "TCS.NS", quantity: 5, buyPrice: 3200 },
      { user: userId, symbol: "INFY.NS", quantity: 15, buyPrice: 1400 }
    ]);

    res.json({ message: "Guest account has been reset to demo state.", walletBalance: 100000 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};