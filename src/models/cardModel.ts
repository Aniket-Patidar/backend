import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IUser } from './userModel';
import { IProduct, IProductVariant } from './productModel';

export interface ICartItem extends Document {
  user: IUser['_id'];
  product: IProduct['_id'];
  variant: IProductVariant['_id'];
  quantity: number;
}

const cartItemSchema: Schema<ICartItem> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    required:true
  },
  quantity: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const CartItem: Model<ICartItem> = mongoose.model<ICartItem>('CartItem', cartItemSchema);

export default CartItem;
