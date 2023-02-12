const Campground = require(`../models/campground`);
const catchAsync = require(`../utils/catchAsync`);
const { uploader } = require(`../cloudinary`);
const mbxGeocoding = require(`@mapbox/mapbox-sdk/services/geocoding`);
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });
module.exports.index = catchAsync(async (req, res) => {
  const camps = await Campground.find();
  res.render(`campgrounds/index`, { camps });
});

module.exports.getNewForm = (req, res) => {
  res.render(`campgrounds/new`);
};

module.exports.createNewCampground = catchAsync(async (req, res, next) => {
  const geoData = await geoCoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  const { campground } = req.body;
  const camp = new Campground(campground);
  camp.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.owner = req.user._id;
  if (geoData.body.features.length !== 0) {
    camp.geometry = geoData.body.features[0].geometry;
  } else {
    camp.geometry = { type: "Point", coordinates: [] };
  }
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
  const { deleteImages } = req.body;
  console.log(deleteImages);
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  if (deleteImages) {
    for (let filename of deleteImages) {
      await uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: deleteImages } } } });
  }
  console.log(campground);
  req.flash(`success`, `Successfully updated the campground `);
  res.redirect(`/campgrounds/${id}`);
});

module.exports.deleteCampground = catchAsync(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash(`success`, `Successfully deleted the campground `);
  res.redirect(`/campgrounds`);
});
