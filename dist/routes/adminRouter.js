"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const adminJwt_1 = require("../middlewares/adminJwt");
const adminControllers_1 = require("../controllers/adminControllers");
router.get("/users", adminJwt_1.isAdmin, adminControllers_1.users);
router.get("/top-products", adminControllers_1.getTopProducts);
router.get("/order-status-last-7-days", adminControllers_1.getOrderStatusLast7Days);
router.get("/info", adminControllers_1.getStats);
exports.default = router;
