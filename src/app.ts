import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware";
import { connectDB } from "./models/dbconnection";
import ErrorHandler from "./middlewares/ErrorHandler";
import userRouter from "./routes/userRouter";
import orderRouter from "./routes/orderRouter";
import addressRouter from "./routes/addressRouter";
import cartRouter from "./routes/addToCardRouter";
import productRouter from "./routes/productRouter";
import cors from 'cors';
import adminRouter from "./routes/adminRouter";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

dotenv.config()

// Apply CORS middleware globally

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());


app.use(cookieParser());
connectDB();


app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/api/user", userRouter);
app.use("/api/user/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/product", productRouter);
app.use("/api/admin", adminRouter);

// 404 Error Handling
app.use("*", (req, res, next) => {
  return next(new ErrorHandler("Page not found", 404));
});

// Error Middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
