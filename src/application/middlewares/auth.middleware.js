// import { asyncHandler } from "../../infrastructure/utils/asyncHandler.js";
import {asyncHandler} from "../../infrastructure/utils/asyncHandler.js"
import { ApiError } from "../../infrastructure/utils/ApiError.js";
import jwt from "jsonwebtoken";
import { getUserById } from "../controllers/user.controllers.js";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const {id, email, name} = await getUserById(decodedToken?.userId);
    const user = {id, email, name};

    req.user = user;
    next();

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
});
