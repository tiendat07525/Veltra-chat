import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Thiếu token kết nối socket"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return next(new Error("Token socket không hợp lệ hoặc đã hết hạn"));
    }

    const user = await User.findById(decoded.userId).select(
      "-hashedPassword -hashPassword"
    );

    if (!user) {
      return next(new Error("Người dùng không tồn tại"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Lỗi khi xác thực JWT trong socket middleware", error);
    next(new Error("Không có quyền truy cập"));
  }
};
