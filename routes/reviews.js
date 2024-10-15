const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

/**************POST ROUTE FOR REVIEWS ************/
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));
/************DELETE A REVIEW **************/
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
