"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    productName: {
        type: String,
        // required: true,
    },
    description: {
        type: String,
        // required: true,
    },
    highlights: {
        type: [String],
    },
    category: {
        type: String,
        enum: ["hairCare", "skincare", "mens"],
        // required: true,
    },
    reviews: [
        {
            text: {
                type: String,
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            images: [
                {
                    fileId: { type: String, default: "" },
                    url: { type: String, default: "" },
                },
            ],
        },
    ],
    variants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "ProductVariant" }],
    discount: {
        type: Number,
        default: 0,
    },
    thumbnail: {
        type: Object,
        default: {
            fileId: "",
            url: "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
    },
    images: {
        type: [
            {
                type: {
                    fileId: { type: String, default: "" },
                    url: {
                        type: String,
                        default: "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    },
                },
            },
        ],
    },
    ingredients: {
        type: [String],
    },
    howToUse: {
        type: [String], // Array of strings for instructions
    },
}, { timestamps: true });
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
