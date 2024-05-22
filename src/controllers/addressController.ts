// controllers/addressController.ts
import { Request, Response } from "express";
import User from "../models/userModel";
import { Types } from "mongoose";
import catchAsyncError from "../middlewares/catchAsyncError";

// Controller to add address to a user
export const addAddress = catchAsyncError(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    console.log(userId);
    const { street, city, zip } = req.body;

    try {
      if (!street || !city || !zip) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.addresses = user.addresses || [];

      user.addresses.push({ street, city, zip });
      await user.save();

      res.status(201).json({ message: "Address added successfully", user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Controller to update address of a user
export const updateAddress = catchAsyncError(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { addressIndex } = req.body;
    const { street, city, zip } = req.body;

    if (!street || !city || !zip) {
        return res.status(400).json({ message: 'Street, city, and zip are required fields' });
      }
      

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const index = parseInt(addressIndex);
      if (isNaN(index) || index < 0 || index >= (user.addresses?.length || 0)) {
        return res.status(404).json({ message: "Invalid address index" });
      }

      user.addresses = user.addresses || [];
      user.addresses[index] = { street, city, zip };

      await user.save();

      res.status(200).json({ message: "Address updated successfully", user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Controller to delete address of a user
export const deleteAddress = async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { addressIndex } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = parseInt(addressIndex);
    if (isNaN(index) || index < 0 || index >= (user.addresses?.length || 0)) {
      return res.status(404).json({ message: "Invalid address index" });
    }

    user.addresses = user.addresses || [];
    user.addresses.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Address deleted successfully", user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to view addresses of a user
export const viewAddresses = async (req: Request, res: Response) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
