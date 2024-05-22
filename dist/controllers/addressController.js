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
exports.viewAddresses = exports.deleteAddress = exports.updateAddress = exports.addAddress = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
// Controller to add address to a user
exports.addAddress = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    console.log(userId);
    const { street, city, zip } = req.body;
    try {
        if (!street || !city || !zip) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.addresses = user.addresses || [];
        user.addresses.push({ street, city, zip });
        yield user.save();
        res.status(201).json({ message: "Address added successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Controller to update address of a user
exports.updateAddress = (0, catchAsyncError_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.user._id;
    const { addressIndex } = req.body;
    const { street, city, zip } = req.body;
    if (!street || !city || !zip) {
        return res.status(400).json({ message: 'Street, city, and zip are required fields' });
    }
    try {
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const index = parseInt(addressIndex);
        if (isNaN(index) || index < 0 || index >= (((_a = user.addresses) === null || _a === void 0 ? void 0 : _a.length) || 0)) {
            return res.status(404).json({ message: "Invalid address index" });
        }
        user.addresses = user.addresses || [];
        user.addresses[index] = { street, city, zip };
        yield user.save();
        res.status(200).json({ message: "Address updated successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Controller to delete address of a user
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = req.user._id;
    const { addressIndex } = req.body;
    try {
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const index = parseInt(addressIndex);
        if (isNaN(index) || index < 0 || index >= (((_b = user.addresses) === null || _b === void 0 ? void 0 : _b.length) || 0)) {
            return res.status(404).json({ message: "Invalid address index" });
        }
        user.addresses = user.addresses || [];
        user.addresses.splice(index, 1);
        yield user.save();
        res.status(200).json({ message: "Address deleted successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteAddress = deleteAddress;
// Controller to view addresses of a user
const viewAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    try {
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ addresses: user.addresses });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.viewAddresses = viewAddresses;
