import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "10m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: REFRESH_TOKEN_TTL,
  };
};

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message: "Thiếu tên đăng nhập, mật khẩu, email, họ hoặc tên",
      });
    }

    const duplicate = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (duplicate) {
      return res.status(409).json({ message: "Tên đăng nhập hoặc email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${lastName} ${firstName}`,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi đăng ký", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu tên đăng nhập hoặc mật khẩu" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    const storedHash = user.hashedPassword || user.hashPassword;

    if (!storedHash) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    const passwordCorrect = await bcrypt.compare(password, storedHash);

    if (!passwordCorrect) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    if (!user.hashedPassword && user.hashPassword) {
      user.hashedPassword = user.hashPassword;
      user.hashPassword = undefined;
      await user.save();
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // PRODUCTION NOTE: Cross-site frontend/backend deployments require HTTPS with secure cookies and sameSite="none".
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      message: `${user.displayName} đã đăng nhập`,
      accessToken,
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken", getRefreshCookieOptions());
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi đăng xuất", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Thiếu refresh token" });
    }

    const session = await Session.findOne({ refreshToken: token });

    if (!session) {
      return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(403).json({ message: "Refresh token đã hết hạn" });
    }

    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi làm mới token", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
