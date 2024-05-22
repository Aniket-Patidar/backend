"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsyncError = (fun) => (req, res, next) => Promise.resolve(fun(req, res, next)).catch(next);
exports.default = catchAsyncError;
