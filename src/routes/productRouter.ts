import { Router } from "express";
const router = Router();
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductVariant,
  postReview,
  getProductReviews,
} from "../controllers/productController";
import { isAdmin } from "../middlewares/adminJwt";
import { authenticateToken } from "../middlewares/JWTtoken";

// Define routes for products
router.post("/", isAdmin, createProduct);
router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.patch("/variant/:variantId", isAdmin, updateProductVariant);
router.patch("/:productId", isAdmin, updateProduct);
router.delete("/:productId", isAdmin, deleteProduct);
router.post("/review/:productId", authenticateToken, postReview);
router.get("/review/:productId", authenticateToken, getProductReviews);


// C72962PXJKH2F1YSHV2BM4KZ
export default router;
