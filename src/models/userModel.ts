import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface Address {
  street: string;
  city: string;
  zip: string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  cartItems?: Schema.Types.ObjectId[];
  orders?: Schema.Types.ObjectId[];
  comparePassword(password: string): Promise<boolean>;
  addresses?: Address[];
  phoneNumber?: string; // Add mobileNumber field
  otp: string;
  otpExpiry: Date;
  verified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: [true, "Role is required."],
    },
    cartItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "CartItem",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    addresses: [
      {
        street: String,
        city: String,
        zip: String,
      },
    ],
    phoneNumber: String,
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    verified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// Hash password before saving the user
userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
