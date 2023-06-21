require('dotenv').config();
const User = require('../models/user');
const twilio=require('twilio');
const accountSid=process.env.TWILIO_ACCOUNT_SID;
const authToken=process.env.TWILIO_AUTH_TOKEN;
const servicesSid=process.env.TWILIO_SERVICES_SID;
const client=twilio(accountSid,authToken);
exports.getLogin = (req, res, next) => {
  res.render("auth/login",{
    layout: "noLayout",
  });
};
exports.postLogin = (req, res, next) => {
  User.findById('648a8549452437be8afd60e3')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err=>{
        console.log(err);
         res.redirect('/');
      })
    })
    .catch(err => console.log(err));
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    res.redirect("/");
  })
};


//Signup controller

exports.getSignup = (req, res, next) => {
  res.render("auth/phoneotp",{
    layout: "noLayout",
  });
};


exports.postSignup = (req, res, next) => {
  const name=req.body.name;
  const email=req.body.email;
  const phone=req.body.phone;
  const password=req.body.password;
  const confirmpassword=req.body.confirmpassword;
  User.findOne({$or:[{email:email},{name:name}]})
  .then(userDoc=>{
    if(userDoc){
      return res.redirect('/signup');
    }
    const user=new User({
      name:name,
      email:email,
      phone:phone,
      password:password,
      cart:{items:[]}
    });
    return user.save();
  })
  .then(result=>{
    res.redirect('/login');
  })
  .catch(err=>{
    console.log(err);
  })
};

exports.sendOtpSignup =async(req, res,next)=>{
    console.log("send otp function is called..........");
    const phoneNumber = `${req.body.phone}`;
    console.log(phoneNumber);
    //Check if the phone number already exists in the database 
    User.findOne({phone:phoneNumber})
    .then((userDoc)=>{
      if(userDoc){
         // Phone number is already registered, show appropriate message
         return res.json({ success: false, message: 'Phone number is already registered. Please try to login.' });
        }else{
          client.verify.v2
      .services(servicesSid)
      .verifications.create({to:phoneNumber,channel: "sms" })
      .then((verification) =>
       {
        console.log(verification.sid);
       return res.json({success:true,message:'OTP send successfully'});
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({success:false,message:"Failed to send OTP"});
      });
        }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }); 
};

exports.getOtpSignup=(req,res,next)=>{
  try {
  console.log('hiii')
  const phoneNumber = "+91"+req.body.phone;
  const phone=req.body.phone;
  const otp=req.body.otp;
  if(!otp){
    return res.render('auth/phoneotp',{layout:'noLayout',message:'Invalid OTP!',phone:phone})
  }else{
    console.log(`${phoneNumber}" "${otp}`);
    client.verify.v2
       .services(servicesSid)
       .verificationChecks.create({ to: phoneNumber, code: otp })
       .then(verification_check=>{
         console.log(verification_check.status);
         if(verification_check.status==='approved'){
           res.render("auth/signup",{phone:phoneNumber});
         }else{
          console.log('Error');
         }
       }).catch(error=>{
        console.log(error);
       })
  }
  } catch (error) {
    conosle.log(error.message);
  }
}


// const verifyOtp = async function (req, res) {
//   try {
//     const phoneNumber = req.session.phoneNumber;
//     const otp = req.body.otp;
//     console.log(phoneNumber + " " + otp);
//     client.verify.v2
//       .services(servicesSid)
//       .verificationChecks.create({ to: phoneNumber, code: otp })
//       .then((verification_check) => {
//         console.log(verification_check.status); 
//         if (verification_check.status === "approved") {
//           // Redirect to the landing page after OTP is approved
//           res.redirect("/");
//         } else {
//           // Handle the case when OTP is not approved, e.g., render an error page
//           res.render("auth/phoneotp", { message: "Invalid OTP" ,layout:'noLayout'});
//         }
//       })
//       }
//       catch(error){
//         console.log(error);
//         // Handle the error if needed
//         res.render("auth/otpVerification", {
//           message: "OTP verification failed",
//         });
//       }
//   }


// exports.postNumber=(req,res,next)=>{
//   const phone=req.body.phone;
 
//   console.log(phone);
// }



