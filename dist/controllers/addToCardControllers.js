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
exports.removeFromCart = exports.updateCart = exports.removeItemFromCart = exports.getAllCartItems = exports.addItemToCart = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const cardModel_1 = __importDefault(require("../models/cardModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const ErrorHandler_1 = __importDefault(require("../middlewares/ErrorHandler"));
const productModel_1 = __importDefault(require("../models/productModel"));
exports.addItemToCart = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, variantId, quantity } = req.body;
    // Check if the product exists
    const product = yield productModel_1.default.findById(productId).populate("variants");
    if (!product) {
        return res
            .status(404)
            .json({ success: false, message: "Product not found" });
    }
    // Check if the variant exists
    const variant = product.variants.find((v) => v._id.toString() === variantId.toString());
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
    const existingCartItem = yield cardModel_1.default.findOne({
        user: req.user._id,
        product: productId,
        variant: variantId,
    });
    if (existingCartItem) {
        // If the same product variant already exists in the cart, update its quantity
        existingCartItem.quantity += quantity;
        yield existingCartItem.save();
    }
    else {
        // Otherwise, create a new cart item
        const newCartItem = new cardModel_1.default({
            user: req.user._id,
            product: productId,
            variant: variantId,
            quantity,
        });
        yield newCartItem.save();
    }
    res
        .status(200)
        .json({ success: true, message: "Item added to cart successfully" });
}));
exports.getAllCartItems = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cartItems = yield cardModel_1.default.find({ user: req.user._id }).populate("product");
    res.status(200).json({ success: true, cartItems });
}));
exports.removeItemFromCart = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.query;
    const cartItem = yield cardModel_1.default.findById(itemId);
    if (!cartItem) {
        return next(new ErrorHandler_1.default("Cart item not found.", 404));
    }
    yield userModel_1.default.findByIdAndUpdate(req.user._id, {
        $pull: { cartItems: itemId },
    });
    yield cardModel_1.default.findByIdAndDelete(itemId);
    res
        .status(200)
        .json({ success: true, message: "Cart item removed successfully." });
}));
exports.updateCart = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const itemsToUpdate = req.body.items;
    for (const item of itemsToUpdate) {
        const { id, quantity } = item;
        const cartItem = yield cardModel_1.default.findById(id);
        if (!cartItem) {
            return next(new ErrorHandler_1.default("Cart item not found.", 404));
        }
        cartItem.quantity = quantity;
        yield cartItem.save();
    }
    res.status(200).json({
        success: true,
        message: "Cart items quantity updated successfully.",
    });
}));
exports.removeFromCart = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const itemIdsToRemove = req.body.itemIds;
    for (const itemId of itemIdsToRemove) {
        const cartItem = yield cardModel_1.default.findById(itemId);
        if (!cartItem) {
            return next(new ErrorHandler_1.default("Cart item not found.", 404));
        }
        yield cardModel_1.default.findByIdAndDelete(itemId);
    }
    res
        .status(200)
        .json({ success: true, message: "Cart items removed successfully." });
}));
