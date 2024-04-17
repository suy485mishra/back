import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser=asyncHandler(async(req,res)=>{
    //get user detail from frontend/postman
    //vaildation
    //check if user already exists:both from username & email
    //check for images,avatar
    //upload to cloudinary,avatar
    //create user object-->create entry in DB
    //remove password and refreshtoken from repsonse 
    //check for user creation, happended or not
    //return res or error
    const {fullName, email,username,password}=req.body
    // console.log('email',email);

    if(!fullName || !email || !username || !password){
        throw new ApiError(400,'All fields are required',);
    };

    const existedUser=await User.findOne({
        //check both fields
        $or: [{username},{email}]
    })
    if(existedUser){
         throw new ApiError(409,'User already registered',);
    }
    console.log(req.files)

    const avatarLocalPath=req?.files?.avatar[0]?.path;//optionally lena --> '?.'
    // const coverImageLocalPath=req?.files?.coverImage[0]?.path;
// upar wale se undefined error
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path    
    }
    //check for avatar, cover img is anyways optional
    if(!avatarLocalPath){
        throw new ApiError(400,'Avatar is required!!!',);
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath);
    const coverImage= await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,'Avatar is required!!!',);
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"//kya kya nhi chhiye
    )
      
    if(!createdUser){
        throw new ApiError(500,'Something went wrong while cretaing user',);
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )

})

export {registerUser}