import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import CartItem from "../models/cardModel";
import User from "../models/userModel";
import ErrorHandler from "../middlewares/ErrorHandler";
import Product from "../models/productModel";

interface CartItemRequest extends Request {
  user?: any;
}

export const addItemToCart = catchAsyncError(
  async (req: CartItemRequest, res: Response, next: NextFunction) => {
    const { productId, variantId, quantity } = req.body;

    // Check if the product exists
    const product = await Product.findById(productId).populate("variants");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if the variant exists
    const variant = product.variants.find(
      (v) => v._id.toString() === variantId.toString()
    );

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Product variant not found" });
    }

    // Check if the quantity requested is valid
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    // Check if the user already has the same product variant in the cart
    const existingCartItem = await CartItem.findOne({
      user: req.user._id,
      product: productId,
      variant: variantId,
    });

    if (existingCartItem) {
      // If the same product variant already exists in the cart, update its quantity
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      // Otherwise, create a new cart item
      const newCartItem = new CartItem({
        user: req.user._id,
        product: productId,
        variant: variantId,
        quantity,
      });
      await newCartItem.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Item added to cart successfully" });
  }
);

export const getAllCartItems = catchAsyncError(
  async (req: CartItemRequest, res: Response, next: NextFunction) => {
    const cartItems = await CartItem.find({ user: req.user._id }).populate(
      "product"
    );
    res.status(200).json({ success: true, cartItems });
  }
);

export const removeItemFromCart = catchAsyncError(
  async (req: CartItemRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.query;
    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      return next(new ErrorHandler("Cart item not found.", 404));
    }
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { cartItems: itemId },
    });
    await CartItem.findByIdAndDelete(itemId);
    res
      .status(200)
      .json({ success: true, message: "Cart item removed successfully." });
  }
);

export const updateCart = catchAsyncError(
  async (req: CartItemRequest, res: Response, next: NextFunction) => {
    const itemsToUpdate = req.body.items;
    for (const item of itemsToUpdate) {
      const { id, quantity } = item;
      const cartItem = await CartItem.findById(id);
      if (!cartItem) {
        return next(new ErrorHandler("Cart item not found.", 404));
      }
      cartItem.quantity = quantity;
      await cartItem.save();
    }
    res.status(200).json({
      success: true,
      message: "Cart items quantity updated successfully.",
    });
  }
);

export const removeFromCart = catchAsyncError(
  async (req: CartItemRequest, res: Response, next: NextFunction) => {
    const itemIdsToRemove = req.body.itemIds;
    for (const itemId of itemIdsToRemove) {
      const cartItem = await CartItem.findById(itemId);
      if (!cartItem) {
        return next(new ErrorHandler("Cart item not found.", 404));
      }
      await CartItem.findByIdAndDelete(itemId);
    }
    res
      .status(200)
      .json({ success: true, message: "Cart items removed successfully." });
  }
);
