const Campground = require(`../models/campground`);
const catchAsync = require(`../utils/catchAsync`);

module.exports.index = catchAsync(async (req, res) => {
  const camps = await Campground.find();
  res.render(`campgrounds/index`, { camps });
});

module.exports.getNewForm = (req, res) => {
  res.render(`campgrounds/new`);
};

module.exports.createNewCampground = catchAsync(async (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError(`Invalid Campground data`, 400);
  const { campground } = req.body;
  const camp = new Campground(campground);
  camp.owner = req.user._id;
  await camp.save();
  req.flash(`success`, `Successfully made a new campground!`);
  res.redirect(`campgrounds/${camp._id}`);
});

module.exports.showCampground = catchAsync(async (req, res) => {
  const camp = await Campground.findById(req.params.id)
    .populate({ path: `reviews`, populate: { path: `owner` } })
    .populate(`owner`);
  if (!camp) {
    req.flash(`error`, `The campground does not exist`);
    return res.redirect(`/campgrounds`);
  }
  res.render(`campgrounds/details`, { camp });
});

module.exports.getEditForm = catchAsync(async (req, res) => {
  const camp = await Campground.findById(req.params.id);
  if (!camp) {
    req.flash(`error`, `The campground does not exist`);
    return res.redirect(`/campgrounds`);
  }
  res.render(`campgrounds/edit`, { camp });
});

module.exports.editCampground = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findOneAndUpdate(id, req.body.campground, { runValidators: true });
  req.flash(`success`, `Successfully updated the campground `);
  res.redirect(`/campgrounds/${id}`);
});

module.exports.deleteCampground = catchAsync(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash(`success`, `Successfully deleted the campground `);
  res.redirect(`/campgrounds`);
});
