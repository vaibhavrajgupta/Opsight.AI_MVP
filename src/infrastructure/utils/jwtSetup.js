import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";
import prisma from "../../domain/db/index.js";
import { asyncHandler } from "./asyncHandler.js";
import { getUserById } from "../../application/controllers/user.controllers.js";
import { ApiResponse } from "./ApiResponse.js";

const generateAccessToken = (userId, email, name) => {
  return jwt.sign(
    {
      userId,
      email,
      name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const generateAccessAndRefreshTokens = async (userId, email, name) => {
  try {
    const accessToken = generateAccessToken(userId, email, name);

    const refreshToken = generateRefreshToken(userId);

    await updateRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const updateRefreshToken = async (userId, refreshToken) =>
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });

export const deleteRefreshToken = async (userId) =>
  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: null,
    },
  });

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await getUserById(decodedToken?.userId);

    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used");

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
