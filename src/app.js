// import express from 'express';
// import path,{dirname} from 'path';
// import { fileURLToPath } from 'url';
// import cookieParser from 'cookie-parser';
// import logger from 'morgan';
// import cors from 'cors';
// import csrf from 'csurf';
// import flash from 'connect-flash';
// import session from 'express-session';
// import hbs from 'express-handlebars';
// import configKeys from './configkeys.js'
import mongoConnect from './config/database.connection.js';
import * as commonImport from './utlis/common/common_imports.js'

// const User = require("./models/user");

//Routes used in the web
// const shopRoutes = require("./routes/shop.Router");
// const adminRoutes = require("./routes/admin.Router");
// const authRoutes = require("./routes/auth");

const app = commonImport.express();
const csrfProtection = commonImport.csrf();
const __filename=commonImport.fileURLToPath(import.meta.url);
const __dirname=commonImport.dirname(__filename);
// eslint-disable-next-line no-undef
app.set("views", commonImport.path.join(__dirname, "views"));
app.engine(
    "hbs",
    commonImport.hbs.engine({
        extname: ".hbs",
        layoutsDir: __dirname + "/views/layouts",
        defaultLayout: "layout",
        partialsDir: __dirname + "/views/partials/",
    })
);
app.set("view engine", "hbs");
app.use(commonImport.logger("dev"));
app.use(commonImport.express.json());
app.use(commonImport.express.urlencoded({ extended: false }));
app.use(commonImport.express.static(commonImport.path.join(__dirname, "public")));
app.use(commonImport.cors());
app.use(commonImport.cookieParser());
app.use(
    commonImport.session({
        secret:commonImport.configKeys.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: commonImport.configKeys.MAX_AGE, // 1 week
        }
    })
);
app.use(csrfProtection);
app.use(commonImport.flash());

const PORT=commonImport.configKeys.PORT||8000;

(async function startServer(){
    await mongoConnect();
    app.listen(PORT,(err)=>{
        if(err){
            throw new Error(err);
        }
        console.log(`Listening on port http://localhost:${PORT}/`);
    });
})();

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.loggedUser = req.session.user;
    next();
});


//Routes used

// app.use(helperFunctions.addUserProductsLengthToContext);
// app.use(helperFunctions.cancelledProducts);
// app.use(helperFunctions.calculateTotalProduct);
// app.use("/admin", adminRoutes);
// app.use("/",shopRoutes);
// app.use("/",authRoutes);
// app.get("/500", errorController.get500);
// app.use(errorController.get404);

// error handler
app.use((error, req,res) => {
    res.status(500).render("500", {
        pageTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
});

export default app;

