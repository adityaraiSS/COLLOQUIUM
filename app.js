if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError"); //our custom Express Error class
const campgoundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
// for storing sessions
// setting up mongo session
const MongoStore = require("connect-mongo");
// security
// mongo santitze
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

/******MONGOOSE CONNECTION ************/
//setting connection with database
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Mongo connection established");
  })
  .catch((err) => {
    console.log("Mongo connection error");
    console.log(err);
  });

// setting ejs and absolute path for views directory
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//*********MIDDLEWARES************
// to encode form data
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({ replaceWith: "_" }));
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

/*******SETTING UP MONGO SESSIONS**********/
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});
store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

/********SESSIONS ************/
const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,

  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(session(sessionConfig));
app.use(flash());

/*******SETTING UP PASSPORT**************/
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});
/*******SETTING UP ROUTES  ************/
app.use("/campgrounds", campgoundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// ********** ROUTES  ************
// home
app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  //giving our custom error
  next(new ExpressError("404! not found", 404));
});
// CUSTOM ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

