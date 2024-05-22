import nodemailer, { SendMailOptions } from "nodemailer"; // Import SendMailOptions for typing mailOptions
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../middlewares/ErrorHandler";

interface SendMailFunction {
  (req: Request, res: Response, next: NextFunction, html: string): void;
}

const sendmail: SendMailFunction = (req, res, next, html) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.MAIL_EMAIL_ADDRESS!,
      pass: process.env.MAIL_EMAIL_PASSWORD!,
    },
  });

  const mailOptions: SendMailOptions = {
    from: "Job portal Company",
    to: req.body.email,
    subject: "Password Reset Link",
    html,
    // "text":"Do not share this link",
  };

  transport.sendMail(mailOptions, (err: Error | null, info: nodemailer.SentMessageInfo) => {
	if (err) {
	  return next(new ErrorHandler(err.message, 500));
	}
	return res.status(200).json({
	  message: "Mail sent successfully!",
	});
  });
  
};

export default sendmail;
