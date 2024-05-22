"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
// jwtUtils.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ username: user.username, email: user.email }, 'accessSecret', { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ username: user.username, email: user.email }, 'refreshSecret', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
