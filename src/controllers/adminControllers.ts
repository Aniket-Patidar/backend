import { Request, Response } from "express";
import { generateToken } from "../middlewares/JWTtoken";
import catchAsyncError from "../middlewares/catchAsyncError";
import User from "../models/userModel";
import Order from "../models/orderModel";
import Product from "../models/productModel";

export const users = catchAsyncError(async (req: Request, res: Response) => {
  const users = await User.find({});
  res.status(200).json({ users });
});

export async function getTopProducts(req: Request, res: Response) {
  try {
    const result = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const productIds = result.map((item: any) => item._id);

    const topProducts = await Product.find({ _id: { $in: productIds } });

    res.json(topProducts);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching top products", error: error.message });
  }
}

export async function getOrderStatusLast7Days(req: Request, res: Response) {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    lastWeek.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
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

    const orderStatusLast7Days = result.map((item: any) => ({
      date: item._id.day,
      day: `Day ${item._id.dayNumber}`,
      orderCount: item.statusCounts.length,
      statusCounts: item.statusCounts,
    }));

    res.json(orderStatusLast7Days);
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: "Error fetching order status for the last 7 days",
        error: error.message as string,
      });
  }
}

export async function getStats(req: Request, res: Response) {
  const totalUsers = await User.countDocuments();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const totalOrders = await Order.countDocuments();
  const newOrders = await Order.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const totalProducts = await Product.countDocuments();
  const newProducts = await Product.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  res.json({
    users: { total: totalUsers, new: newUsers },
    orders: { total: totalOrders, new: newOrders },
    products: { total: totalProducts, new: newProducts },
  });
}
