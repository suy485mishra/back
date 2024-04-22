import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
const options = {
  httpOnly: true,
  secure: true
}
//no need of asynchandler as its not a web operation
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
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

const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {email, username, password} = req.body
  console.log(email);

  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})

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
  

  //clear cookies

  return res.status(200).clearCookie('accessToken',options)
  .clearCookie('refreshToken')
  .json(new ApiResponse(200,{},"User successfully logged out"))
});


//refreshaccesstoken ka endpoint
const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized req")
  }

  try {
    //lets verify token-->secret aur token bhejo
    const decodedToken =jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_ACCESS_SECRET,
    )
    //AB MILEGA decoded token
    //generaterefreshtoken method mein hmne id le li this to mongodb se id fetch krlete h bhaijaan
    
    const user=await User.findById(decodedToken?._id)
   
    if(!user){
      throw new ApiError(401,"Invalid refreshtoken")
    }
  
    //match
    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"Refresh is already or expired or used")
    }
  
    //ab match ho gya token
  
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user?._id)
  
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                accessToken, refreshToken:newRefreshToken
            },
            "Acess token refreshed successfully"
        )
    )
  
  } catch (error) {
    throw new ApiError(401,error?.message ||
    "Invalid refresh token")
  }


})
export { registerUser, loginUser, logoutUser,refreshAccessToken };
 