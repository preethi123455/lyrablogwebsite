import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import authMiddleware from "../middleware/authmiddleware.js";
import { registerController , loginController , logoutController , meController } from "../controllers/Usercontroller.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", logoutController);

router.get("/me",authMiddleware,meController);

export default router;
