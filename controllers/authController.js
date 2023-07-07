require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const servicesSid = process.env.TWILIO_SERVICES_SID;
const client = twilio(accountSid, authToken);
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
// const {validateResult}=require('express-validator')

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    layout: "noLayout",
    errorMessage: message,
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            if(!user.status){
              req.flash("error","Your account has been blocked by the admin.Please Contact Admin!");
              return res.redirect('/login');
            }
            //Check if the user is an admin
            if (user.is_Admin) {
              console.log(user.is_Admin);
              req.session.isAdmin = true;
              req.session.user = user;
              req.session.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.redirect("/admin");
              });
            } else {
              req.session.isAdmin = false;
              req.session.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.redirect("/");
              });
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            console.log(email);
          } else {
            req.flash("error", "Password doesn't match!");
           return   res.render("auth/login", {
            layout: "noLayout",
            errorMessage: message,
          });
          }
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};


exports.postLogout=(req,res,next)=>{
  if(req.session.isAdmin){
    //Destroy admin session
    req.session.isAdmin=false;
    req.session.destroy((err)=>{
      res.redirect('/login');
    })
  }else{
    //Destroy user session
    req.session.destroy((err)=>{
      res.redirect('/');
    })
  }
}

//Signup controller

exports.getSignup = (req, res, next) => {
  res.render("auth/phoneotp", {
    layout: "noLayout",
  });
};

exports.postSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;
  User.findOne({ $or: [{ email: email }, { name: name }] })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "E-Mail exists already,please pick a different one");
        return res.render("auth/signup", {
          errorMessage: message,
          phone: phone,
        });
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
          transporter.sendMail({
            to: email,
            from: "arunkumarararun20123@gmail.com",
            subject: "SignUp Succeeded!",
            html: `<p>"Congratulations,${name},on a successful login👏!We're here to assist you in finding the perfect products. Enjoy your time on Plantso!😊"<p>`,
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.sendOtpSignup = async (req, res, next) => {
  const phoneNumber = `${req.body.phone}`;
  //Check if the phone number already exists in the database
  User.findOne({phone: phoneNumber})
    .then((userDoc) => {
      if (userDoc) {
        // Phone number is already registered, show appropriate message
        return res.json({
          success: false,
          message: "Phone number is already registered. Please try to login.",
        });
      } else {
        client.verify.v2
          .services(servicesSid)
          .verifications.create({ to: phoneNumber, channel: "sms" })
          .then((verification) => {
            console.log(verification.sid);
            return res.json({
              success: true,
              message: "OTP send successfully",
            });
          })
          .catch((error) => {
            console.log(error);
            return res
              .status(500)
              .json({ success: false, message: "Failed to send OTP" });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    });
};

exports.getOtpSignup = (req, res, next) => {
  try {
    const phoneNumber = "+91" + req.body.phone;
    const phone = req.body.phone;
    const otp = req.body.otp;
    if (!otp) {
      return res.render("auth/phoneotp", {
        layout: "noLayout",
        message: "Invalid OTP!",
        phone: phone,
      });
    } else {
      console.log(`${phoneNumber}" "${otp}`);
      client.verify.v2
        .services(servicesSid)
        .verificationChecks.create({ to: phoneNumber, code: otp })
        .then((verification_check) => {
          console.log(verification_check.status);
          if (verification_check.status === "approved") {
            res.render("auth/signup", { phone: phoneNumber });
          } else {
            console.log("Error");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  } catch (error) {
    conosle.log(error.message);
  }
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/resetpassword", {
    layout: "noLayout",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; //current date+ 1hour
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "arunkumarararun20123@gmail.com",
          subject: "Password-reset",
          html: `
          <p>You request a password reset for Plantso website🪴</p>
          <p>Click this <a href="http://localhost:5000/reset/${token}">Redirect To Plantso website To reset!</a>to set a new password.</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        layout: "noLayout",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
  .then(user=>{
    resetUser=user;
    return bcrypt.hash(newPassword,12);
  })
  .then(hashedPassword=>{
    resetUser.password=hashedPassword;
    resetUser.resetToken=undefined;
    resetUser.resetTokenExpiration=undefined;
    return resetUser.save();
  })
  .then(result=>{
    res.redirect('/login');
  })
  .catch(err=>{
    console.log(err);
  })
};
