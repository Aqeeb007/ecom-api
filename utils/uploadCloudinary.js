import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Make sure to set up cloudinary configuration before using it
cloudinary.config({
  cloud_name: "dleizvwv5",
  api_key: "868692892353219",
  api_secret: "1zXYJKDkLFgtpORT_8NlO_DBWDA",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
