const Campground = require(`../models/campground`);
const Review = require(`../models/review`);
const catchAsync = require(`../utils/catchAsync`);

module.exports.createReview = catchAsync(async (req, res) => {
  const review = new Review(req.body.review);
  const campground = await Campground.findById(req.params.id);
  campground.reviews.push(review);
  review.owner = req.user._id;
  await review.save();
  await campground.save();
  req.flash(`success`, `Successfully added review!`);
  res.redirect(`/campgrounds/${req.params.id}`);
});

module.exports.deleteReview = catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash(`success`, `Successfully deleted review!`);
  res.redirect(`/campgrounds/${id}`);
});
