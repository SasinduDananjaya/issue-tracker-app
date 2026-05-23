import issueService from "../services/issueService.js";

//issue controller to handle incoming requests and send responses
const issueController = {
  async create(req, res, next) {
    try {
      const issue = await issueService.create(req.body, req.user.id, req.user.organizationCode);
      res.status(201).json({ success: true, issue });
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const result = await issueService.list(req.query, req.user.organizationCode);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async stats(req, res, next) {
    try {
      const stats = await issueService.getStats(req.user.organizationCode);
      res.status(200).json({ success: true, stats });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const issue = await issueService.getByUuid(req.params.uuid, req.user.organizationCode);
      res.status(200).json({ success: true, issue });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const issue = await issueService.update(req.params.uuid, req.body, req.user.id, req.user.organizationCode);
      res.status(200).json({ success: true, issue });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await issueService.remove(req.params.uuid, req.user.id, req.user.organizationCode);
      res.status(200).json({ success: true, message: "Issue deleted" });
    } catch (err) {
      next(err);
    }
  },

  async auditLog(req, res, next) {
    try {
      const logs = await issueService.getAuditLog(req.params.uuid, req.user.organizationCode);
      res.status(200).json({ success: true, logs });
    } catch (err) {
      next(err);
    }
  },
};

export default issueController;
