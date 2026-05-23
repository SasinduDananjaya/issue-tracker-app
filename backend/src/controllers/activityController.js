import auditLogRepository from "../repositories/auditLogRepository.js";

const activityController = {
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await auditLogRepository.findAll(req.user.organizationCode, { page, limit });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },
};

export default activityController;
