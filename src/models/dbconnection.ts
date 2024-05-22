import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DBURI as string);
    console.log("db connected");
  } catch (error) {
    console.log(error, "db error");
  }
};
