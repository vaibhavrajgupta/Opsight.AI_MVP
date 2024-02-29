import { Router } from "express";
import {
  login,
  logout,
  register,
} from "../../application/controllers/auth.controllers.js";
import { upload } from "../../application/middlewares/multer.middleware.js";
import { isLoggedIn } from "../../application/middlewares/auth.middleware.js";
import { refreshAccessToken } from "../utils/jwtSetup.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(isLoggedIn, logout);
router.route("/refresh").post(refreshAccessToken);

export default router;
