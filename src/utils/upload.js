// src/utils/upload.js
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudianryConfig.js";

// Multer memory storage (files in memory buffer)
export const multerStorage = multer.memoryStorage();
export const upload = multer({ storage: multerStorage });

// helper to upload a single buffer to cloudinary
export const uploadBufferToCloudinary = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
