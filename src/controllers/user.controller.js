import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//no need of asynchandler as its not a web operation
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    //generate tokens-->no need op await as no db operations
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //save token inside db
    user.refreshToken = refreshToken;
    //save without validation
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontend/postman
  //vaildation
  //check if user already exists:both from username & email
  //check for images,avatar
  //upload to cloudinary,avatar
  //create user object-->create entry in DB
  //remove password and refreshtoken from repsonse
  //check for user creation, happended or not
  //return res or error
  const { fullName, email, username, password } = req.body;
  // console.log('email',email);

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    //check both fields
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already registered");
  }
  console.log(req.files);

  const avatarLocalPath = req?.files?.avatar[0]?.path; //optionally lena --> '?.'
  // const coverImageLocalPath=req?.files?.coverImage[0]?.path;
  // upar wale se undefined error
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  //check for avatar, cover img is anyways optional
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!!!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required!!!");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //kya kya nhi chhiye
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while cretaing user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //steps:
  //req->body mein se data
  //username or email se login
  //   find the user
  //pswd check
  //access and refresh token
  //send cookie

  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(4000, "email and pswd both are reqd");
  }

  const user = await User.findOne({
    $or: [{ email, username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //cookies k sath kuch options bhi send krne pdte hain
  const options = {
    //ye niche vali cheezien krne se cookies sirf server se modify kr skte na ki frontend se joki by default hota h
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(
        200,
        //why sending tokens again jb cookiw mein bhej hi  diye-->as ho skta h cookie se na mil paye
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(

    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },

    },

    {
      new: true,
    }

  );
  const options = {
    //ye niche vali cheezien krne se cookies sirf server se modify kr skte na ki frontend se joki by default hota h
    httpOnly: true,
    secure: true,
  };

  //clear cookies

  return res.status(200).clearCookie('accessToken',options)
  .clearCookie('refreshToken')
  .json(new ApiResponse(200,{},"User successfully logged out"))
});

export { registerUser, loginUser, logoutUser };
