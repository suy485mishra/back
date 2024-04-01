import { v2 as cloudinary } from "cloudinary";
//file system
import fs from fs;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });


  //upload on cloudinary from local server, local server pe to h file

const uploadOnCloudinary=async(localFilePath)=>{
   try {
    //local path hi ni h
    if(!localFilePath)return null;

    //agar h path to upload kr na
    const res=await cloudinary.uploader.upload(localFilePath,{
        resource_type:'auto'
    })
    //upload successful print kra lete h
    console.log('file has been uploaded',res.url);

    //user ko return to kro response
    return res;
   } catch (error) {
    //server se htado in a synchronous way 
    fs.unlinkSync(localFilePath)
    return null
   }
  }
export {uploadOnCloudinary}