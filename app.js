require("dotenv").config();
const express = require("express");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const csrf = require("csurf");
const flash = require("connect-flash");
const helperFunctions = require("./src/registerHelpers");
const errorController = require("./controllers/errorController");

//config files used for database configuration
const {mongoConnect} = require("./config/mongoDb");
//used for multer configuration
const upload = require("./config/multer");
//used for middleware user to get user model
const User = require("./models/user");
//used for session handling
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

//requiring hbs module using npm
const hbs = require("express-handlebars");

//Routes used in the web
const shopRoutes = require("./routes/shop.Router");
const adminRoutes = require("./routes/admin.Router");
const authRoutes = require("./routes/auth");

const app = express();

const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: "sessions",
});



const csrfProtection = csrf();



app.set("views", path.join(__dirname, "views"));
app.engine(
    "hbs",
    hbs.engine({
        extname: ".hbs",
        layoutsDir: __dirname + "/views/layouts",
        defaultLayout: "layout",
        partialsDir: __dirname + "/views/partials/",
        helpers: helperFunctions,
    })
);
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
//static files path set using express-static
app.use(express.static(path.join(__dirname, "public")));
//multer middleware used
app.use(upload.array("image"));
app.use(cors());
app.use(cookieParser());

//session config necessary data
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        },
        store: store,
    })
);
app.use(csrfProtection);
app.use(flash());


app.use((req, res, next) => {
    res.header(
        "Cache-Control",
        "no-cache,private,no-Store,must-revalidate,max-scale=0,post-check=0,pre-check=0"
    );
    next();
});

const port=process.env.PORT||5000;
app.listen(port,(err)=>{
    if(err){
        throw new Error(err);
    }
    console.log(`Listening on port http://localhost:${port}/`);
});

mongoConnect();

// mongoConnect().then(() => {
//   console.log('Connected to MongoDB');
//   const port = process.env.PORT || 3000;
//   app.listen(port, () => {
//     console.log(`Listening on port http://localhost:${port}/`);
//   });
// }).catch((error) => {
//   console.log('MongoDB connection failed:', error);
// });

console.clear();

//Routes used

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.loggedUser = req.session.user;
    next();
});



app.use(helperFunctions.addUserProductsLengthToContext);
app.use(helperFunctions.calculateTotalProduct);
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.get("/500", errorController.get500);

app.use(errorController.get404);

// error handler
app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render("500", {
        pageTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
});

module.exports = app;

