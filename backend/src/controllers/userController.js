import userRepository from "../repositories/userRepository.js";

const userController = {
  async listOrgMembers(req, res, next) {
    try {
      const members = await userRepository.findOrgMembers(req.user.organizationCode);
      res.status(200).json({ success: true, members });
    } catch (err) {
      next(err);
    }
  },
};

export default userController;
