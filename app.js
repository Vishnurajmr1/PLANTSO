require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser=require('body-parser');
const {mongoConnect}=require('./config/mongoDb')

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
mongoConnect();
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
