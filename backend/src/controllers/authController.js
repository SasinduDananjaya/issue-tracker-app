import authService from "../services/authService.js";

const IS_PROD = process.env.NODE_ENV === "production";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000, //7d
  path: "/api/auth", //only sent to auth endpoints
};

const setRefreshCookie = (res, token) => res.cookie("refreshToken", token, REFRESH_COOKIE_OPTIONS);
const clearRefreshCookie = (res) => res.clearCookie("refreshToken", { ...REFRESH_COOKIE_OPTIONS, maxAge: undefined });

//auth controller to handle incoming requests and send responses
const authController = {
  async register(req, res, next) {
    try {
      const { refreshToken, accessToken, user } = await authService.register(req.body);
      setRefreshCookie(res, refreshToken);
      res.status(201).json({ success: true, accessToken, user });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { refreshToken, accessToken, user } = await authService.login(req.body);
      setRefreshCookie(res, refreshToken);
      res.status(200).json({ success: true, accessToken, user });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return next({ status: 401, message: "No refresh token" });
      const result = await authService.refresh({ refreshToken });
      setRefreshCookie(res, result.refreshToken);
      res.status(200).json({ success: true, accessToken: result.accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) await authService.logout({ refreshToken });
      clearRefreshCookie(res);
      res.status(200).json({ success: true, message: "Logged out" });
    } catch (err) {
      next(err);
    }
  },

  getMyInfo(req, res) {
    res.status(200).json({ success: true, user: req.user });
  },
};

export default authController;
