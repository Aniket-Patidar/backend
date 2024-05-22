"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPassword = exports.requestOTP = exports.verifyOtp = exports.signup = exports.logout = exports.updateProfile = exports.login = void 0;
const JWTtoken_1 = require("../middlewares/JWTtoken");
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const userModel_1 = __importDefault(require("../models/userModel"));
const twilioService_1 = require("../utils/twilioService");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
exports.login = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = yield user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = (0, JWTtoken_1.generateToken)(user);
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Login successful", token });
}));
exports.updateProfile = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { username, email } = req.body;
    const user = yield userModel_1.default.findByIdAndUpdate(_id, req.body, { new: true });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    yield user.save();
    res
        .status(200)
        .json({ message: "User profile updated successfully", user });
}));
exports.logout = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}));
exports.signup = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, phoneNumber, password } = req.body;
    let user = yield userModel_1.default.findOne({ phoneNumber });
    if (user) {
        if (user.otpExpiry && user.otpExpiry > new Date()) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            yield (0, twilioService_1.sendOTP)(phoneNumber, otp);
            user = yield userModel_1.default.findOneAndUpdate({ phoneNumber }, { otp, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) }, { new: true });
        }
        else {
            const otp = Math.floor(100000 + Math.random() * 900000);
            yield (0, twilioService_1.sendOTP)(phoneNumber, otp);
            user = yield userModel_1.default.findOneAndUpdate({ phoneNumber }, {
                otp,
                otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
                username,
                email,
                password,
            }, { new: true });
        }
    }
    else {
        const otp = Math.floor(100000 + Math.random() * 900000);
        yield (0, twilioService_1.sendOTP)(phoneNumber, otp);
        user = yield new userModel_1.default({
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
}));
exports.verifyOtp = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, phoneNumber } = req.body;
    try {
        // Find user with matching phone number and OTP
        const user = yield userModel_1.default.findOne({ phoneNumber, otp });
        if (!user) {
            return res.status(401).json({ message: "Invalid OTP" });
        }
        // Check if OTP is expired
        if (user.otpExpiry < new Date()) {
            return res.status(401).json({ message: "OTP has expired" });
        }
        user.verified = true;
        yield user.save();
        const token = (0, JWTtoken_1.generateToken)(user);
        res.cookie("token", token, { httpOnly: true });
        res
            .status(201)
            .json({ message: "User created successfully", user: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
let tempUser = {}; // Temporary variable to store user info
const requestOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, email } = req.body;
    if (phoneNumber) {
        const user = yield userModel_1.default.findOne({ phoneNumber });
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            yield (0, twilioService_1.sendOTP)(phoneNumber, otp);
            user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = otp.toString();
            yield user.save();
            try {
                res
                    .status(200)
                    .json({ success: true, msg: "OTP is sent to your mobile number" });
            }
            catch (error) {
                console.error("Error saving user with otpExpiry:", error);
                res.status(500).json({ success: false, msg: "Internal server error" });
            }
        }
        else {
            res.status(404).json({
                success: false,
                msg: "User not found with the provided phone number",
            });
        }
    }
    else if (email) {
        const user = yield userModel_1.default.findOne({ email });
        if (user) {
            tempUser = user;
            const otp = Math.floor(100000 + Math.random() * 900000);
            yield (0, sendMail_1.default)(req, res, next, `
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
    `);
            user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = otp.toString();
            try {
                yield tempUser.save();
                res
                    .status(200)
                    .json({ success: true, msg: "OTP is sent to your email address" });
            }
            catch (error) {
                console.error("Error saving user with otpExpiry:", error);
                res.status(500).json({ success: false, msg: "Internal server error" });
            }
        }
        else {
            res.status(404).json({
                success: false,
                msg: "User not found with the provided email",
            });
        }
    }
    else {
        res.status(400).json({
            success: false,
            msg: "Please provide either phoneNumber or email",
        });
    }
});
exports.requestOTP = requestOTP;
exports.verifyOTPassword = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, phoneNumber, email, password } = req.body;
    try {
        let user;
        if (phoneNumber) {
            user = yield userModel_1.default.findOne({ phoneNumber, otp });
        }
        else {
            user = yield userModel_1.default.findOne({ email: email, otp });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(401).json({ message: "OTP has expired" });
        }
        user.password = password;
        yield user.save();
        const token = (0, JWTtoken_1.generateToken)(user);
        res.cookie("token", token, { httpOnly: true });
        res
            .status(201)
            .json({ message: "User created successfully", user: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
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
