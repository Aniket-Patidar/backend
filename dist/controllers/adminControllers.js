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
exports.getStats = exports.getOrderStatusLast7Days = exports.getTopProducts = exports.users = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const userModel_1 = __importDefault(require("../models/userModel"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
exports.users = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.default.find({});
    res.status(200).json({ users });
}));
function getTopProducts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield orderModel_1.default.aggregate([
                { $unwind: "$items" },
                { $group: { _id: "$items.product", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]);
            const productIds = result.map((item) => item._id);
            const topProducts = yield productModel_1.default.find({ _id: { $in: productIds } });
            res.json(topProducts);
        }
        catch (error) {
            res
                .status(500)
                .json({ message: "Error fetching top products", error: error.message });
        }
    });
}
exports.getTopProducts = getTopProducts;
function getOrderStatusLast7Days(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
            lastWeek.setHours(0, 0, 0, 0);
            const result = yield orderModel_1.default.aggregate([
                {
                    $match: {
                        createdAt: { $gte: lastWeek, $lt: today }, // Filter orders in the last 7 days
                    },
                },
                {
                    $group: {
                        _id: {
                            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
                            dayNumber: { $dayOfWeek: "$createdAt" }, // Get the day of the week
                        },
                        statusCounts: { $addToSet: "$status" }, // Count distinct statuses per day
                    },
                },
            ]);
            const orderStatusLast7Days = result.map((item) => ({
                date: item._id.day,
                day: `Day ${item._id.dayNumber}`,
                orderCount: item.statusCounts.length,
                statusCounts: item.statusCounts,
            }));
            res.json(orderStatusLast7Days);
        }
        catch (error) {
            res
                .status(500)
                .json({
                message: "Error fetching order status for the last 7 days",
                error: error.message,
            });
        }
    });
}
exports.getOrderStatusLast7Days = getOrderStatusLast7Days;
function getStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const totalUsers = yield userModel_1.default.countDocuments();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = yield userModel_1.default.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
        });
        const totalOrders = yield orderModel_1.default.countDocuments();
        const newOrders = yield orderModel_1.default.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
        });
        const totalProducts = yield productModel_1.default.countDocuments();
        const newProducts = yield productModel_1.default.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
        });
        res.json({
            users: { total: totalUsers, new: newUsers },
            orders: { total: totalOrders, new: newOrders },
            products: { total: totalProducts, new: newProducts },
        });
    });
}
exports.getStats = getStats;
