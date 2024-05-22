"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const dbconnection_1 = require("./models/dbconnection");
const ErrorHandler_1 = __importDefault(require("./middlewares/ErrorHandler"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const orderRouter_1 = __importDefault(require("./routes/orderRouter"));
const addressRouter_1 = __importDefault(require("./routes/addressRouter"));
const addToCardRouter_1 = __importDefault(require("./routes/addToCardRouter"));
const productRouter_1 = __importDefault(require("./routes/productRouter"));
const cors_1 = __importDefault(require("cors"));
const adminRouter_1 = __importDefault(require("./routes/adminRouter"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
dotenv_1.default.config();
// Apply CORS middleware globally
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
(0, dbconnection_1.connectDB)();
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
}));
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
// Routes
app.use("/api/user", userRouter_1.default);
app.use("/api/user/address", addressRouter_1.default);
app.use("/api/order", orderRouter_1.default);
app.use("/api/cart", addToCardRouter_1.default);
app.use("/api/product", productRouter_1.default);
app.use("/api/admin", adminRouter_1.default);
// 404 Error Handling
app.use("*", (req, res, next) => {
    return next(new ErrorHandler_1.default("Page not found", 404));
});
// Error Middleware
app.use(errorMiddleware_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
