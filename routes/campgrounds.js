const express = require(`express`);
const router = express.Router();

const catchAsync = require(`../utils/catchAsync`);
const ExpressError = require(`../utils/ExpressError`);

const Campground = require(`../models/campground`);
const { campgroundSchema } = require(`../schemas`);

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(`,`);
    throw new ExpressError(msg, 400);
  } else next();
};

router.get(
  `/`,
  catchAsync(async (req, res) => {
    const camps = await Campground.find();
    res.render(`campgrounds/index`, { camps });
  })
);

router.get(`/new`, (req, res) => {
  res.render(`campgrounds/new`);
});

router.post(
  `/`,
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError(`Invalid Campground data`, 400);
    const { campground } = req.body;
    const camp = new Campground(campground);
    await camp.save();
    req.flash(`success`, `Successfully made a new campground!`);
    res.redirect(`campgrounds/${camp._id}`);
  })
);

router.get(
  `/:id`,
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate(`reviews`);
    if (!camp) {
      req.flash(`error`, `The campground does not exist`);
      return res.redirect(`/campgrounds`);
    } else res.render(`campgrounds/details`, { camp });
  })
);

router.get(
  `/:id/edit`,
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
      req.flash(`error`, `The campground does not exist`);
      return res.redirect(`/campgrounds`);
    } else res.render(`campgrounds/edit`, { camp });
  })
);

router.put(
  `/:id/edit`,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndUpdate(id, req.body.campground, { runValidators: true });
    req.flash(`success`, `Successfully updated the campground `);
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id/delete",
  catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash(`success`, `Successfully deleted the campground `);
    res.redirect(`/campgrounds`);
  })
);

module.exports = router;
