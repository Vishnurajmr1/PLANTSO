require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser=require('body-parser');
const cors = require('cors');
const csrf=require('csurf');
const flash=require('connect-flash');
const helperFunctions=require('./src/registerHelpers');

//config files used for database configuration
const {mongoConnect}=require('./config/mongoDb');
//used for multer configuration 
const upload = require("./config/multer");
//used for middleware user to get user model
const User=require('./models/user');
//used for session handling
const session=require('express-session');
const MongoDBStore=require('connect-mongodb-session')(session);


//requiring hbs module using npm 
const hbs=require('express-handlebars');

//Routes used in the web
const shopRoutes = require('./routes/shop.Router');
const adminRoutes = require('./routes/admin.Router');
const authRoutes = require('./routes/auth');


const app = express();

const store=new MongoDBStore({
  uri:process.env.MONGO_URL,
  collection:'sessions'
});

const csrfProtection=csrf();

// const formatDate=function (date) {
//   const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//   return date.toLocaleDateString(undefined, options);
// };

app.set('views', path.join(__dirname, 'views'));
app.engine(
  'hbs',
  hbs.engine({
    extname: '.hbs',
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout: 'layout',
    partialsDir: __dirname + '/views/partials/',
    // helpers:{
    //   formatDate:formatDate,
    // }
    helpers:helperFunctions,
  })
);
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
//static files path set using express-static
app.use(express.static(path.join(__dirname, 'public')));
//multer middleware used
app.use(upload.single('image'));
app.use(cors());
app.use(cookieParser());

//session config necessary data
app.use(
  session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,// 1 week
    },
    store:store
  })
);
app.use(csrfProtection);
app.use(flash());

const setInitialUser=async()=>{
  try{
    //Connect to MongoDB
    await mongoConnect();
    console.log('User saved to MongoDB');
  }catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache,private,no-Store,must-revalidate,max-scale=0,post-check=0,pre-check=0');
  next();
})
mongoConnect();
console.clear();
//setInitialUser();


//Routes used 

app.use((req,res,next)=>{
  if(!req.session.user){
   return next(); 
  }
  User.findById(req.session.user._id)
  .then(user=>{
    req.user=user;
    next();
  })
  .catch(err=>console.log(err));
})

app.use((req,res,next)=>{
  res.locals.isAuthenticated=req.session.isLoggedIn;
  res.locals.csrfToken=req.csrfToken();
  res.locals.loggedUser=req.session.user;
  next();
});

const calculateTotalProduct = (req, res, next) => {
  if (req.user && req.user.cart && req.user.cart.items) {
    res.locals.totalProduct = req.user.cart.items.length;
  } else {
    res.locals.totalProduct = 0;
  }
  next();
};

const addUserProductsLengthToContext=async(req,res,next)=>{
  try{
    if(req.user){
      const userId=req.user._id;
      const userProductsLength=await helperFunctions.getUserProductsLength(userId);
      res.locals.userProductsLength=userProductsLength;
    }else{
      res.locals.userProductsLength=0;
    }
    next()
  }catch(error){
    console.log(error);
    next(error);
  }
}
app.use('/',addUserProductsLengthToContext);
app.use('/',calculateTotalProduct);

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


//Error page rendering
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