const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPathOfFile) => {
  try {
    if (!localPathOfFile) return null;

    const ext = path.extname(localPathOfFile).toLowerCase();

    let resourceType = "auto";
    let uploadOptions = {};

    // Handle different file types
    if ([".pdf", ".doc", ".docx", ".txt", ".rtf"].includes(ext)) {
      resourceType = "raw";
      if (ext === ".pdf") {
        uploadOptions.flags = "attachment"; // Fixes PDF loading issue
      }
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"].includes(ext)) {
      resourceType = "image";
    } else if ([".mp4", ".avi", ".mov", ".wmv"].includes(ext)) {
      resourceType = "video";
    }

    const uploadResult = await cloudinary.uploader.upload(localPathOfFile, {
      resource_type: resourceType,
      ...uploadOptions
    });

    fs.unlinkSync(localPathOfFile);
    return uploadResult;

  } catch (error) {
    if (fs.existsSync(localPathOfFile)) {
      fs.unlinkSync(localPathOfFile);
    }
    throw error;
  }
};

module.exports = { uploadOnCloudinary}