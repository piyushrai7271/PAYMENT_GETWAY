import express from "express";
import {userAuth} from "../middlewares/userAuth.middleware.js";
import {
    registerUser,
    loginUser,
    logOut,
    changePassword
} from "../controllers/user.controller.js";
const router = express.Router()

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",userAuth,logOut);
router.post("/change-password",userAuth,changePassword);
export default router;