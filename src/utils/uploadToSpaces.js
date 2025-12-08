import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.SPACES_REGION,
  endpoint: `https://${process.env.SPACES_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
});

export const uploadToSpaces = async (file, fileName) => {
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: fileName, // file name
    Body: file.buffer, // file buffer
    ACL: "public-read", // access control
    contentType: file.mimetype, // content type
  };

  await s3.send(new PutObjectCommand(params));

  return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_ENDPOINT}/${fileName}`;
};

export const deleteFromSpaces = async (fileName) => {
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: fileName,
  };

  await s3.send(new DeleteObjectCommand(params));
  return true;
};
