import { Router } from "express";
import { authController } from "../controllers/auth-controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  changePasswordSchema,
  deleteAccountSchema,
  loginSchema,
  registerSchema,
  updateAccountSchema,
} from "../validations/auth-validation.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);
authRoutes.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", authenticate, authController.me);
authRoutes.patch(
  "/account",
  authenticate,
  validate({ body: updateAccountSchema }),
  authController.updateAccount,
);
authRoutes.patch(
  "/password",
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);
authRoutes.delete(
  "/account",
  authenticate,
  validate({ body: deleteAccountSchema }),
  authController.deleteAccount,
);
