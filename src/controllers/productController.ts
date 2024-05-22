import { Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import Product, { IProduct } from "../models/productModel";
import productVariantSchema from "../models/productVariant";
import ProductVariant from "../models/productVariant";
import { FilterQuery } from "mongoose";
import path from "path";

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: "draw7t9sz",
  api_key:process.env.cloudinary_api_key,
  api_secret:process.env.cloudinary_api_secret,
});


export const createProduct = catchAsyncError(async (req: Request, res: Response) => {
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
    const modifiedName = `ecommerce-${Date.now()}${path.extname(thumbnail.name)}`;

    // Upload thumbnail to cloudinary
    const thumbnailUpload = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
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
      const modifiedName = `ecommerce-${Date.now()}${path.extname(image.name)}`;

      // Upload each image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(image.tempFilePath, {
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
  const product = await Product.create(productData);

  // Create the product variants with reference to the product
  const newVariants = await Promise.all(
    variantData.map(async (data: any) => {
      data.product = product._id; // Set the product reference in the variant data
      return await ProductVariant.create(data);
    })
  );

  // Update the product with the newly created variants
  product.variants = newVariants.map((variant: any) => variant._id);
  await product.save();

  res.status(201).json({ success: true, product });
});

export const getAllProducts = catchAsyncError(
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const searchQuery: any = {};

      if (req.query.search) {
        searchQuery.productName = {
          $regex: new RegExp(req.query.search as string, "i"),
        };
      }

      if (req.query.category) {
        searchQuery.category = req.query.category;
      }

      if (req.query.maxPrice) {
        const variants = await ProductVariant.find({
          price: req.query.maxPrice,
        });
        const productIds = variants.map((variant) => variant.product);
        searchQuery._id = { $in: productIds };
      }

      const totalProducts = await Product.countDocuments(searchQuery);

      // Fetch products with pagination, search, and filters
      const products = await Product.find(searchQuery)
        .populate("variants")
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        success: true,
        products,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export const getProductById = catchAsyncError(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  }
);

export const updateProduct = catchAsyncError(
  async (req: Request, res: Response) => {
    // Check if images are uploaded
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      const imageUrls = [];

      for (const image of images) {
        const modifiedName = `ecommerce-${Date.now()}${path.extname(
          image.name
        )}`;

        // Upload each image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(
          image.tempFilePath,
          {
            folder: "product_images",
            public_id: modifiedName,
          }
        );

        // Add image URL to array
        imageUrls.push({
          fileId: imageUpload.public_id,
          url: imageUpload.secure_url,
        });
      }

      // Add image URLs to req.body
      req.body.images = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  }
);

export const deleteProduct = catchAsyncError(
  async (req: Request, res: Response) => {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  }
);

export const updateProductVariant = catchAsyncError(
  async (req: Request, res: Response) => {
    const variantId = req.params.variantId;
    const variantData = req.body; // Partial<IProductVariant> to allow updating only specific fields
    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      variantId,
      variantData,
      { new: true }
    );
    if (!updatedVariant) {
      return res
        .status(404)
        .json({ success: false, message: "Product variant not found" });
    }
    res.status(200).json({ success: true, variant: updatedVariant });
  }
);

interface IReviewImage {
  fileId: string;
  url: string;
}

interface IReview {
  text?: string;
  rating?: number;
  images?: IReviewImage[];
}

export const postReview = catchAsyncError(
  async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const { text, rating } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Create review object
    const review: IReview = {
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
        const modifiedName = `ecommerce-${Date.now()}${path.extname(
          image.name
        )}`;

        // Upload each image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(
          image.tempFilePath,
          {
            folder: "review_images",
            public_id: modifiedName,
          }
        );

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
    await product.save();

    res
      .status(201)
      .json({ success: true, message: "Review posted successfully" });
  }
);

export const getProductReviews = catchAsyncError(
  async (req: Request, res: Response) => {
    const productId = req.params.productId;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Return product reviews
    res.status(200).json({ success: true, reviews: product.reviews });
  }
);
