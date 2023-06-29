const multer = require("multer");
const path = require("path");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,"public/images/product-images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g,'-')+ file.originalname);
  },
});

//file validation
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const Multer = multer({
  storage: fileStorage,
  // limits:{fileSize:1024 *1024},
  fileFilter: fileFilter,
});

module.exports = Multer;
