"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_1.authController.register);
router.post('/login', auth_1.authController.login);
router.post('/refresh', auth_1.authController.refreshToken);
// Protected routes
router.post('/logout', auth_2.authMiddleware, auth_1.authController.logout);
router.get('/profile', auth_2.authMiddleware, auth_1.authController.getProfile);
router.put('/profile', auth_2.authMiddleware, auth_1.authController.updateProfile);
exports.default = router;
