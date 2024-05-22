import { NextFunction, Request, Response } from "express";
import { generateToken } from "../middlewares/JWTtoken";
import catchAsyncError from "../middlewares/catchAsyncError";
import User from "../models/userModel";
import { sendOTP } from "../utils/twilioService";
import sendmail from "../utils/sendMail";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const login = catchAsyncError(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user);
  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({ message: "Login successful", token });
});

export const updateProfile = catchAsyncError(
  async (req: Request, res: Response) => {
    const { _id } = req.user;
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(_id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.save();
    res
      .status(200)
      .json({ message: "User profile updated successfully", user });
  }
);

export const logout = catchAsyncError(async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

export const signup = catchAsyncError(async (req: Request, res: Response) => {
  const { username, email, phoneNumber, password } = req.body;
  let user = await User.findOne({ phoneNumber });

  if (user) {
    if (user.otpExpiry && user.otpExpiry > new Date()) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendOTP(phoneNumber, otp);

      user = await User.findOneAndUpdate(
        { phoneNumber },
        { otp, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) },
        { new: true }
      );
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendOTP(phoneNumber, otp);

      user = await User.findOneAndUpdate(
        { phoneNumber },
        {
          otp,
          otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
          username,
          email,
          password,
        },
        { new: true }
      );
    }
  } else {
    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendOTP(phoneNumber, otp);

    user = await new User({
      username,
      email,
      phoneNumber,
      otp,
      password,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    }).save();
  }

  res.locals.phoneNumber = phoneNumber;
  res
    .status(200)
    .json({ success: true, msg: "OTP is sent to your mobile number" });
});

export const verifyOtp = catchAsyncError(
  async (req: Request, res: Response) => {
    const { otp, phoneNumber } = req.body;
    try {
      // Find user with matching phone number and OTP
      const user = await User.findOne({ phoneNumber, otp });

      if (!user) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      // Check if OTP is expired
      if (user.otpExpiry < new Date()) {
        return res.status(401).json({ message: "OTP has expired" });
      }

      user.verified = true;
      await user.save();

      const token = generateToken(user);
      res.cookie("token", token, { httpOnly: true });
      res
        .status(201)
        .json({ message: "User created successfully", user: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

let tempUser: any = {}; // Temporary variable to store user info

export const requestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumber, email } = req.body;

  if (phoneNumber) {
    const user = await User.findOne({ phoneNumber });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendOTP(phoneNumber, otp);
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      user.otp = otp.toString();
      await user.save();
      try {
        res
          .status(200)
          .json({ success: true, msg: "OTP is sent to your mobile number" });
      } catch (error) {
        console.error("Error saving user with otpExpiry:", error);
        res.status(500).json({ success: false, msg: "Internal server error" });
      }
    } else {
      res.status(404).json({
        success: false,
        msg: "User not found with the provided phone number",
      });
    }
  } else if (email) {
    const user = await User.findOne({ email });

    if (user) {
      tempUser = user;
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendmail(
        req,
        res,
        next,
        `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
      </head>
      <body>
          <h2>Password Reset OTP</h2>
          <p>Dear ${req.body.email},</p>
          <p>You've requested to reset your password for [Your Platform/Service].</p>
          <p>To proceed, please use the following One-Time Password (OTP):</p>
          <p><strong>OTP:</strong>${otp}</p>
          <p>This OTP is valid for [Insert Duration, e.g., 10 minutes].</p>
          <p>If you haven't requested this password reset, please ignore this message.</p>
          <br>
          <p>Thank you,</p>
          <p>[Your Name/Your Platform]</p>
      </body>
      </html>
    `
      );

      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      user.otp = otp.toString();

      try {
        await tempUser.save();
        res
          .status(200)
          .json({ success: true, msg: "OTP is sent to your email address" });
      } catch (error) {
        console.error("Error saving user with otpExpiry:", error);
        res.status(500).json({ success: false, msg: "Internal server error" });
      }
    } else {
      res.status(404).json({
        success: false,
        msg: "User not found with the provided email",
      });
    }
  } else {
    res.status(400).json({
      success: false,
      msg: "Please provide either phoneNumber or email",
    });
  }
};

export const verifyOTPassword = catchAsyncError(
  async (req: Request, res: Response) => {
    const { otp, phoneNumber, email, password } = req.body;
    try {
      let user;
      if (phoneNumber) {
        user = await User.findOne({ phoneNumber, otp });
      } else {
        user = await User.findOne({ email: email, otp });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid OTP" });
      }
      if (user.otpExpiry < new Date()) {
        return res.status(401).json({ message: "OTP has expired" });
      }
      user.password = password;
      await user.save();
      const token = generateToken(user);
      res.cookie("token", token, { httpOnly: true });
      res
        .status(201)
        .json({ message: "User created successfully", user: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// export const signUp = catchAsyncError(async (req: Request, res: Response) => {
//   const { username, password, email } = req.body;
//   const existingUser = await User.findOne({ username });
//   if (existingUser) {
//     return res.status(400).json({ message: "Username already exists" });
//   }
//   const newUser = await User.create({ username, password, email });
//   const token = generateToken(newUser);
//   res.cookie("token", token, { httpOnly: true });
//   res.status(201).json({ message: "User created successfully", user: newUser });
// });
