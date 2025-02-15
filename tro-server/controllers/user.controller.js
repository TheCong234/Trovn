import { BaseResponse } from "../responses/BaseResponse.js";
import UserService from "../services/user.service.js";
import { logger } from "../config/winston.js";
import { otpTemplate } from "../utils/otp.template.utils.js";
import { sendMail } from "../utils/mailer.utils.js";
import { statusCode } from "../config/statusCode.js";

const UserController = {
  async getUser(req, res) {
    const userId = req.params.id;
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res
          .status(statusCode.NOT_FOUND)
          .json(BaseResponse.error("Không tìm thấy người dùng", null));
      }
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", user));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },

  async getUserByZaloId(req, res) {
    try {
      const zaloId = req.params.id;
      const data = req.body;
      const user = await UserService.getUserByZaloId(zaloId, data);
      if (!user) {
        return res
          .status(statusCode.NOT_FOUND)
          .json(BaseResponse.error("Không tìm thấy người dùng", null));
      }
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", user));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },

  async getUserByEmail(req, res) {
    const email = req.params.email;
    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return res
          .status(statusCode.NOT_FOUND)
          .json(BaseResponse.error("Không tìm thấy người dùng", null));
      }
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", user));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const { token, refreshToken } = await UserService.login(email, password);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: true,
        path: "/",
        sameSite: "None",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      res.cookie("token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 365 * 24 * 60 * 60 * 1000,
        domain: "h5.zdn.vn",
      });

      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", token));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res
          .status(statusCode.NOT_FOUND)
          .json(BaseResponse.error("Không tìm thấy người dùng", null));
      }
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", user));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async createUser(req, res) {
    const userData = req.body;
    try {
      const newUser = await UserService.createUser(userData);
      return res
        .status(statusCode.CREATED)
        .json(BaseResponse.success("Thành công", newUser));
    } catch (error) {
      logger.error(error);
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async updateUser(req, res) {
    const userId = req.params.id;
    const updatedData = req.body;

    try {
      const updatedUser = await UserService.updateUser(userId, updatedData);
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", updatedUser));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async updateUserAvatar(req, res) {
    const userId = req.params.id;
    const { file } = req;

    try {
      const updatedUser = await UserService.updateUserAvatar(userId, file);
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", updatedUser));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async deleteUser(req, res) {
    const userId = req.params.id;

    try {
      await UserService.deleteUser(userId);
      return res.status(statusCode.NO_CONTENT).send();
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async getUserOtp(req, res) {
    const { user } = req;
    try {
      await UserService.sendEmailVerify(user);
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", null));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async verifyEmail(req, res) {
    const { otp, email } = req.body;
    try {
      if ((email, otp)) {
        await UserService.verifyEmail(email, otp);
        return res
          .status(statusCode.OK)
          .json(BaseResponse.success("Thành công", null));
      }
      return res
        .status(statusCode.BAD_REQUEST)
        .json(BaseResponse.success("Vui lòng đăng nhập và nhập otp", null));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async sendEmail(req, res) {
    const { email } = req.params;
    const { subject, otp } = req.body;
    try {
      const template = otpTemplate(email, otp);
      await sendMail(email, subject, template);
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Gửi email thành công", null));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async changePassword(req, res) {
    const { id } = req.params;
    const { password } = req.body;
    try {
      const changePass = await UserService.changePassword(id, password);
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Cập nhật mật khẩu thành công", changePass));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", users));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;
      const { newToken, newRefreshToken } = await UserService.refreshToken(
        refreshToken
      );
      if (newRefreshToken) {
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          path: "/",
          sameSite: "strict",
        });
      }
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", newToken));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },

  async getBalance(req, res) {
    try {
      const { id } = req.user;
      const balance = await UserService.getBalance(id);
      return res
        .status(statusCode.OK)
        .json(BaseResponse.success("Thành công", balance));
    } catch (error) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json(BaseResponse.error(error.message, error));
    }
  },
};

export default UserController;
