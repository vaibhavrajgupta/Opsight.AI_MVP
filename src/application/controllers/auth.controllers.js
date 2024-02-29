import bcrypt from "bcrypt";
import {
  createUser,
  getUserByEmail,
} from "./user.controllers.js";


import { asyncHandler } from "../../infrastructure/utils/asyncHandler.js";
import { ApiError } from "../../infrastructure/utils/ApiError.js";
import { ApiResponse } from "../../infrastructure/utils/ApiResponse.js";
import {deleteRefreshToken, generateAccessAndRefreshTokens} from "../../infrastructure/utils/jwtSetup.js"

export const register = asyncHandler(async (req, res) => {
  console.log("register route came");
  try {
    const { org_name, name, password, email } = req.body;

    if (
      [org_name, email, name, password].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, "User is already registered......");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({
      org_name,
      name,
      password: hashedPassword,
      email,
    });

    const user = await getUserByEmail(email);
    if (!user) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    const registeredUser = { org_name, name, email };

    return res
      .status(201)
      .json(
        new ApiResponse(200),
        registeredUser,
        "User registered Successfully"
      );
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      status: error.statusCode || 500,
      data: null,
      errors: [error.message || "Internal Server Error"],
      success: false,
    });
  }
});

export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new ApiError(400, "username or email is required");
    }

    const user = await getUserByEmail(email);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.id,
      user.email,
      user.name
    );


    const { name, email: userEmail } = await getUserByEmail(email);
    const loggedUser = { email: userEmail, name };

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedUser, accessToken, refreshToken },
          "User Logged In Successfully"
        )
      );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
});

export const logout = asyncHandler(async (req, res)=>{
  await deleteRefreshToken(req.user.id);
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
