const express = require(`express`);
const path = require(`path`);
const mongoose = require(`mongoose`);
const Campground = require(`./models/campground`);
const Review = require(`./models/review`);
const methodOverride = require(`method-override`);
const catchAsync = require(`./utils/catchAsync`);
const ExpressError = require(`./utils/ExpressError`);
const { campgroundSchema, reviewSchema } = require(`./schemas`);
const ejsMate = require(`ejs-mate`);
const { findById } = require("./models/review");
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`MONGO CONNECTION OPEN!!`);
  })
  .catch((err) => {
    console.log(`ERROR MONGO CONNECTION`);
    console.log(err);
  });

const app = express();
app.engine(`ejs`, ejsMate);
app.set(`view engine`, `ejs`);
app.set(`views`, path.join(__dirname, `views`));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(`_method`));

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(`,`);
    throw new ExpressError(msg, 400);
  } else next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((eL) => eL.message).join(`,`);
    throw new ExpressError(msg, 400);
  } else next();
};

app.get(`/`, (req, res) => {
  res.render(`home`);
});

app.get(
  `/campgrounds`,
  catchAsync(async (req, res) => {
    const camps = await Campground.find();
    res.render(`campgrounds/index`, { camps });
  })
);

app.get(`/campgrounds/new`, (req, res) => {
  res.render(`campgrounds/new`);
});

app.post(
  `/campgrounds`,
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError(`Invalid Campground data`, 400);
    const { campground } = req.body;
    const camp = new Campground(campground);
    await camp.save();
    res.redirect(`campgrounds/${camp._id}`);
  })
);

app.get(
  `/campgrounds/:id`,
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate(`reviews`);
    res.render(`campgrounds/details`, { camp });
  })
);

app.get(
  `/campgrounds/:id/edit`,
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render(`campgrounds/edit`, { camp });
  })
);

app.put(
  `/campgrounds/:id/edit`,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndUpdate(id, req.body.campground, { runValidators: true });
    res.redirect(`/campgrounds/${id}`);
  })
);

app.delete(
  "/campgrounds/:id/delete",
  catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect(`/campgrounds`);
  })
);

app.post(`/campgrounds/:id/review`, validateReview, async (req, res) => {
  const review = new Review(req.body.review);
  const campground = await Campground.findById(req.params.id);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${req.params.id}`);
});

app.delete(`/campgrounds/:campId/reviews/:reviewId`, async (req, res) => {
  const { campId, reviewId } = req.params;
  await Campground.findByIdAndUpdate(campId, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${campId}`);
});

app.all(`*`, (req, res, next) => {
  next(new ExpressError(`Page Not found`, 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = `Something Went Wrong:(`;
  res.status(statusCode).render(`error`, { err });
});

app.listen(3000, () => {
  console.log(`On port 3000`);
});
