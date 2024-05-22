import { Router } from "express";
const router = Router();

import {
  getAllCartItems,
  addItemToCart,
  removeItemFromCart,
  updateCart,
} from "../controllers/addToCardControllers";
import { authenticateToken } from "../middlewares/JWTtoken";

router.get("/", authenticateToken, getAllCartItems);
router.post("/add", authenticateToken, addItemToCart);
router.delete("/remove", authenticateToken, removeItemFromCart);
router.put("/update", authenticateToken, updateCart);

export default router;
