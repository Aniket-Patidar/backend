import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProductVariant extends Document {
  packSize: number;
  price: number;
  stock: number;
  unit: "ml" | "mg" | "kg" | "gram";
  product: Schema.Types.ObjectId;
}

const productVariantSchema: Schema<IProductVariant> = new Schema({
  packSize: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ["ml", "mg", "kg", "gram"],
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model
  },
});

const ProductVariant: Model<IProductVariant> = mongoose.model<IProductVariant>(
  "ProductVariant",
  productVariantSchema
);

export default ProductVariant;
