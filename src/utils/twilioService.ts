
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendOTP = async (phoneNumber: string, otp: number) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP for registration is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`OTP sent to ${phoneNumber}`);
    return "OTP sent successfully";
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send OTP");
  }
};
