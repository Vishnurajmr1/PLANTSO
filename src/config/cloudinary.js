import { v2 as cloudinary } from "cloudinary";
import configKeys from '../configkeys.js';

cloudinary.config({
  cloud_name: configKeys.CLOUDINARY_CLOUD_NAME,
  api_key: configKeys.CLOUDINARY_API_KEY,
  api_secret: configKeys.CLOUDINARY_API_SECRET,
  secure: true,
});
export default cloudinary;
