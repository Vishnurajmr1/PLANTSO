const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.patch("/verify-otp", authController.sendOtpSignup);

router.post("/verify-otp", authController.getOtpSignup);

router.post("/signup", check('email').isEmail(),authController.postSignup);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
