require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser=require('body-parser');
const cors = require('cors');
// const multer=require('multer');
const {mongoConnect}=require('./config/mongoDb');
const upload = require("./config/multer");
const User=require('./models/user');

// const mongoose=require('mongoose');
// const fileStorage=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'./public/images/product-images/');
//   },
//   filename:(req,file,cb)=>{
//     cb(null,new Date().toISOString()+'-'+file.originalname);
//   },
// });
// const fileFilter=(req,file,cb)=>{
//   if(file.mimetype=== 'image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
//     cb(null,true);
//   }else{
//     cb(null,false);
//   }
// }

const session=require('express-session');
const hbs=require('express-handlebars');
const shopRoutes = require('./routes/shop.Router');
const adminRoutes = require('./routes/admin.Router');
const authRoutes = require('./routes/auth');
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine(
  "hbs",
  hbs.engine({
    extname: ".hbs",
    layoutsDir: __dirname +"/views/layouts",
    defaultLayout: "layout",
    partialsDir: __dirname +"/views/partials/",
  })
);
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(upload.single('image'));
app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,// 1 week
    },
  })
);
// app.use(express.static(path.join(__dirname, '')));

app.use((req,res,next)=>{
  User.findById('648a8549452437be8afd60e3')
  .then(user=>{
    req.user=user;
    next();
  })
  .catch(err=>console.log(err));
});
const setInitialUser=async()=>{
  try{
    //Connect to MongoDB
    await mongoConnect();

    //Check if a user already exists
    const existingUser=await User.findOne({name:'Max'});

    if(existingUser){
      console.log('User already exists in the database');
      return;
    }
    //Create new user
    const user = new User({
      name:'Max',
      email: 'max@test.com',
      cart:{
        items:[]
      }
    });

    await user.save();
    console.log('User saved to MongoDB');
  }catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
console.clear();
setInitialUser();
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
