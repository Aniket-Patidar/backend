"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const productController_1 = require("../controllers/productController");
const adminJwt_1 = require("../middlewares/adminJwt");
const JWTtoken_1 = require("../middlewares/JWTtoken");
// Define routes for products
router.post("/", adminJwt_1.isAdmin, productController_1.createProduct);
router.get("/", productController_1.getAllProducts);
router.get("/:productId", productController_1.getProductById);
router.patch("/variant/:variantId", adminJwt_1.isAdmin, productController_1.updateProductVariant);
router.patch("/:productId", adminJwt_1.isAdmin, productController_1.updateProduct);
router.delete("/:productId", adminJwt_1.isAdmin, productController_1.deleteProduct);
router.post("/review/:productId", JWTtoken_1.authenticateToken, productController_1.postReview);
router.get("/review/:productId", JWTtoken_1.authenticateToken, productController_1.getProductReviews);
// C72962PXJKH2F1YSHV2BM4KZ
exports.default = router;
