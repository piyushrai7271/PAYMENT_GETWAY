import express from "express";
import {
    registerUser,
    loginUser,
    logOut,
    changePassword
} from "../controllers/user.controller.js";
const router = express.Router()

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logOut);
router.post("/change-password",changePassword);
export default router;