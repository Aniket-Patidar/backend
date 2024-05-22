"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer")); // Import SendMailOptions for typing mailOptions
const ErrorHandler_1 = __importDefault(require("../middlewares/ErrorHandler"));
const sendmail = (req, res, next, html) => {
    const transport = nodemailer_1.default.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.MAIL_EMAIL_ADDRESS,
            pass: process.env.MAIL_EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: "Job portal Company",
        to: req.body.email,
        subject: "Password Reset Link",
        html,
        // "text":"Do not share this link",
    };
    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            return next(new ErrorHandler_1.default(err.message, 500));
        }
        return res.status(200).json({
            message: "Mail sent successfully!",
        });
    });
};
exports.default = sendmail;
