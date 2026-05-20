import authService from "../services/authService.js";

//auth controller to handle incoming requests and send responses
const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.body);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.body);
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
