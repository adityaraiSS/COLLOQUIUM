const { campgroundValSchema, reviewValSchema } = require("./validationSchemas");
const ExpressError = require("./utils/ExpressError"); //our custom Express Error class
const Campground = require("./models/campgrounds");
const Review = require("./models/reviews");

/****IS LOGGED IN MIDDLEWARE *********/
module.exports.isLoggedIn = function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  } else {
    next();
  }
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

/********CAMPGROUND MIDDLEWARES  *************/
/******* MIDDLEWARES **********/
// joi's middleware for campground validations
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundValSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "Sorry, you do not have permission for that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

/*******MIDDLEWARE FOR REVIEWS ************/

// middleware to validate reviews
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewValSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "Sorry, you do not have permission for that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
