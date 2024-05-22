import { Document, Schema, model } from "mongoose";
import { IUser } from "./userModel";
import { IProduct } from "./productModel";

export interface IOrderItem {
  product: Schema.Types.ObjectId;
  variant: Schema.Types.ObjectId; // Add variant field
  quantity: number;
}

export interface IOrder extends Document {
  user: IUser["_id"];
  items: IOrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  totalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  paymentStatus: "unpaid" | "paid" | "partially_paid";
}

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "partially_paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export default model<IOrder>("Order", orderSchema);
