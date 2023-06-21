const express = require('express');
const authController=require('../controllers/authController');
const router = express.Router();


router.get("/login",authController.getLogin);

router.get('/signup',authController.getSignup);

router.post("/login",authController.postLogin);

router.patch("/verify-otp",authController.sendOtpSignup);
router.post("/verify-otp",authController.getOtpSignup);

router.post("/signup",authController.postSignup);

router.post("/logout",authController.postLogout);




module.exports=router;