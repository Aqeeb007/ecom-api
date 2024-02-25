import { Seller } from "../models/Seller.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/uploadCloudinary.js";

const generateAccessTokens = async (sellerId) => {
  try {
    const seller = await Seller.findById(sellerId);
    const token = seller.generateAccessToken();

    return { token };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

class SellerController {
  static createSeller = asyncHandler(async (req, res) => {
    const { name, email, password, mobileNumber, shopName } = req.body;

    const sellerFound = await Seller.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (sellerFound) {
      throw new ApiError(409, "Seller with email or phone number already exists");
    }

    const avatar = req.files?.avatar[0]?.path;

    if (!avatar) {
      throw new ApiError(400, "Avatar file is required");
    }

    const result = await uploadOnCloudinary(avatar);

    if (!result) {
      throw new ApiError(400, "Avatar file is required");
    }

    const seller = await Seller.create({
      name,
      shopName,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      email,
      password,
      mobileNumber,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          seller,
          `${seller.name} account has been created successfully!`
        )
      );
  });

  static loginSeller = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const seller = await Seller.findOne({ email });

    if (!seller) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await seller.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const loggedInUser = await Seller.findById(seller._id).select("-password");

    const { token } = await generateAccessTokens(loggedInUser._id);

    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
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
            seller: loggedInUser,
            token,
          },
          "Welcome to Shopify!"
        )
      );
  });
  static loadSeller = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.seller._id).select("-password");

    if (!seller) {
      throw new ApiError(404, "User does not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, seller, "User data fetched success"));
  });

  static logoutSeller = asyncHandler(async (req, res) => {
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

  static getSellerById = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.params.id).select("-password");

    if (!seller) {
      throw new ApiError(404, "User does not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, seller, "User data fetched success"));
  });
}

export default SellerController;
