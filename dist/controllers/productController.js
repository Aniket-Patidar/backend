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
exports.getProductReviews = exports.postReview = exports.updateProductVariant = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const productModel_1 = __importDefault(require("../models/productModel"));
const productVariant_1 = __importDefault(require("../models/productVariant"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: "draw7t9sz",
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_api_secret,
});
exports.createProduct = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { productData, variantData } = req.body;
    // Sample product data
    productData = {
        productName: "lakhan",
        description: "This is an example product",
        highlights: ["Highlight 1", "Highlight 2"],
        category: "hairCare",
        reviews: [
            {
                text: "Great product!",
                rating: 5,
            },
            {
                text: "Could be better",
                rating: 3,
            },
        ],
        discount: 10,
        productHeroImages: ["image1.jpg", "image2.jpg"],
        detailedImages: ["image3.jpg", "image4.jpg"],
        ingredients: ["Ingredient 1", "Ingredient 2"],
        howToUse: ["Step 1: Use", "Step 2: Enjoy"],
    };
    // Sample variant data (array of variants)
    variantData = [
        {
            packSize: 100,
            price: 20.99,
            stock: 10,
            unit: "ml",
        },
        {
            packSize: 200,
            price: 30.99,
            stock: 20,
            unit: "ml",
        },
        // Add more variants as needed
    ];
    // Check if thumbnail is uploaded
    if (req.files && req.files.thumbnail) {
        const thumbnail = Array.isArray(req.files.thumbnail)
            ? req.files.thumbnail[0]
            : req.files.thumbnail;
        const modifiedName = `ecommerce-${Date.now()}${path_1.default.extname(thumbnail.name)}`;
        // Upload thumbnail to cloudinary
        const thumbnailUpload = yield cloudinary_1.v2.uploader.upload(thumbnail.tempFilePath, {
            folder: "thumbnails",
            public_id: modifiedName,
        });
        // Add thumbnail URL to product data
        productData.thumbnail = {
            fileId: thumbnailUpload.public_id,
            url: thumbnailUpload.secure_url,
        };
    }
    // Check if images are uploaded
    if (req.files && req.files.images) {
        const images = Array.isArray(req.files.images)
            ? req.files.images
            : [req.files.images];
        const imageUrls = [];
        for (const image of images) {
            const modifiedName = `ecommerce-${Date.now()}${path_1.default.extname(image.name)}`;
            // Upload each image to cloudinary
            const imageUpload = yield cloudinary_1.v2.uploader.upload(image.tempFilePath, {
                folder: "product_images",
                public_id: modifiedName,
            });
            // Add image URL to array
            imageUrls.push({
                fileId: imageUpload.public_id,
                url: imageUpload.secure_url,
            });
        }
        // Add image URLs to product data
        productData.images = imageUrls;
    }
    // Create the product
    const product = yield productModel_1.default.create(productData);
    // Create the product variants with reference to the product
    const newVariants = yield Promise.all(variantData.map((data) => __awaiter(void 0, void 0, void 0, function* () {
        data.product = product._id; // Set the product reference in the variant data
        return yield productVariant_1.default.create(data);
    })));
    // Update the product with the newly created variants
    product.variants = newVariants.map((variant) => variant._id);
    yield product.save();
    res.status(201).json({ success: true, product });
}));
exports.getAllProducts = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = {};
        if (req.query.search) {
            searchQuery.productName = {
                $regex: new RegExp(req.query.search, "i"),
            };
        }
        if (req.query.category) {
            searchQuery.category = req.query.category;
        }
        if (req.query.maxPrice) {
            const variants = yield productVariant_1.default.find({
                price: req.query.maxPrice,
            });
            const productIds = variants.map((variant) => variant.product);
            searchQuery._id = { $in: productIds };
        }
        const totalProducts = yield productModel_1.default.countDocuments(searchQuery);
        // Fetch products with pagination, search, and filters
        const products = yield productModel_1.default.find(searchQuery)
            .populate("variants")
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));
exports.getProductById = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productModel_1.default.findById(req.params.productId);
    if (!product) {
        return res
            .status(404)
            .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
}));
exports.updateProduct = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if images are uploaded
    if (req.files && req.files.images) {
        const images = Array.isArray(req.files.images)
            ? req.files.images
            : [req.files.images];
        const imageUrls = [];
        for (const image of images) {
            const modifiedName = `ecommerce-${Date.now()}${path_1.default.extname(image.name)}`;
            // Upload each image to cloudinary
            const imageUpload = yield cloudinary_1.v2.uploader.upload(image.tempFilePath, {
                folder: "product_images",
                public_id: modifiedName,
            });
            // Add image URL to array
            imageUrls.push({
                fileId: imageUpload.public_id,
                url: imageUpload.secure_url,
            });
        }
        // Add image URLs to req.body
        req.body.images = imageUrls;
    }
    const product = yield productModel_1.default.findByIdAndUpdate(req.params.productId, req.body, { new: true });
    if (!product) {
        return res
            .status(404)
            .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
}));
exports.deleteProduct = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productModel_1.default.findByIdAndDelete(req.params.productId);
    if (!product) {
        return res
            .status(404)
            .json({ success: false, message: "Product not found" });
    }
    res
        .status(200)
        .json({ success: true, message: "Product deleted successfully" });
}));
exports.updateProductVariant = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const variantId = req.params.variantId;
    const variantData = req.body; // Partial<IProductVariant> to allow updating only specific fields
    const updatedVariant = yield productVariant_1.default.findByIdAndUpdate(variantId, variantData, { new: true });
    if (!updatedVariant) {
        return res
            .status(404)
            .json({ success: false, message: "Product variant not found" });
    }
    res.status(200).json({ success: true, variant: updatedVariant });
}));
exports.postReview = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const { text, rating } = req.body;
    // Find the product
    const product = yield productModel_1.default.findById(productId);
    if (!product) {
        return res
            .status(404)
            .json({ success: false, message: "Product not found" });
    }
    // Create review object
    const review = {
        text,
        rating,
        images: [],
    };
    // Check if images are uploaded
    if (req.files && req.files.images) {
        const images = Array.isArray(req.files.images)
            ? req.files.images
            : [req.files.images];
        for (const image of images) {
            const modifiedName = `ecommerce-${Date.now()}${path_1.default.extname(image.name)}`;
            // Upload each image to cloudinary
            const imageUpload = yield cloudinary_1.v2.uploader.upload(image.tempFilePath, {
                folder: "review_images",
                public_id: modifiedName,
            });
            if (!review.images) {
                review.images = [];
            }
            // Add image URL to review
            review.images.push({
                fileId: imageUpload.public_id,
                url: imageUpload.secure_url,
            });
        }
    }
    if (!product.reviews) {
        product.reviews = [];
    }
    // Add the review to the product
    product.reviews.push(review);
    yield product.save();
    res
        .status(201)
        .json({ success: true, message: "Review posted successfully" });
}));
exports.getProductReviews = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    // Find the product
    const product = yield productModel_1.default.findById(productId);
    if (!product) {
        return res
            .status(404)
            .json({ success: false, message: "Product not found" });
    }
    // Return product reviews
    res.status(200).json({ success: true, reviews: product.reviews });
}));
