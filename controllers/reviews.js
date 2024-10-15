const Campground = require("../models/campgrounds"); //req campground model
const Review = require("../models/reviews");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const { body, rating } = req.body;
  const review = new Review({ body, rating });
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();

  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${id}`);
};
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("success", "Successfully deleted review!");
  res.redirect(`/campgrounds/${id}`);
};
