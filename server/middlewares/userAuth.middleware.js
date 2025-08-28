import Users from "../model/user.model.js";
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !decoded.id) {
      // ✅ only checking id
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
    }

    const user = await Users.findById(decoded.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token verification failed",
    });
  }
};

export { userAuth };
