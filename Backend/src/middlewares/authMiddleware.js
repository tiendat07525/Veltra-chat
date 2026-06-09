import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Thiếu access token" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ message: "Access token không hợp lệ hoặc đã hết hạn" });
      }

      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword -hashPassword"
      );

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Lỗi khi xác thực JWT", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
