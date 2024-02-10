import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const configKeys = {
  MONGO_DB_URL: process.env.MONGO_URL,
  PORT: process.env.PORT,
  SESSION_SECRET: process.env.SESSION_SECRET,
  MAX_AGE:process.env.Max_Age,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_SERVICES_SID: process.env.TWILIO_SERVICES_SID,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  PROFILE_PIC: process.env.PROFILE_PIC,
};

export default configKeys;
