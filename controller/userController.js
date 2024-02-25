import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/uploadCloudinary.js";

const generateAccessTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const token = user.generateAccessToken();

    return { token };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

class UserController {
  static createUser = asyncHandler(async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      throw new ApiError(400, "All fields are required");
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, "Passwords not matched");
    }

    const userFound = await User.findOne({ email });

    if (userFound) {
      throw new ApiError(409, "User with email already exists");
    }

    let result = null;
    let public_id = "";
    let url = "";

    if (req.files.avatar) {
      const avatar = req.files?.avatar[0]?.path;
      result = avatar && (await uploadOnCloudinary(avatar));
    }

    if (result) {
      public_id = result.public_id;
      url = result.secure_url;
    }

    const user = await User.create({
      name: "User",
      avatar: {
        public_id,
        url,
      },
      email,
      password,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          user,
          `${user.name} account has been created successfully!`
        )
      );
  });

  static loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and Password is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User does not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const loggedInUser = await User.findById(user._id).select("-password");

    const { token } = await generateAccessTokens(loggedInUser._id);
    

    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: "none",
      secure: true,
    };

    return res
      .status(200)
      .cookie("token", token, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            token,
          },
          "Welcome to Shopify!"
        )
      );
  });
  static loadUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User data fetched success"));
  });

  static logoutUser = asyncHandler(async (req, res) => {
    const options = {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("token", options)
      .json(new ApiResponse(200, {}, "Thanks for using Shopify!"));
  });

  static getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User data fetched success"));
  });
}

export default UserController;
