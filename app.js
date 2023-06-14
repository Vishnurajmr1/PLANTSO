require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser=require('body-parser');
const cors = require('cors');
const {mongoConnect}=require('./config/mongoDb');
const User=require('./models/user');

// const mongoose=require('mongoose');
const session=require('express-session');
const hbs=require('express-handlebars');
const shopRouter = require('./routes/shop.Router');
const adminRouter = require('./routes/admin.Router');
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
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
  User.findById('648719ff55688049105d1b8a')
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
app.use('/', shopRouter);
app.use('/admin', adminRouter);

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
