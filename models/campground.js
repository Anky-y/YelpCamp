const mongoose = require(`mongoose`);
const { campgroundSchema } = require("../schemas");
const Review = require(`./review`);
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual(`thumbnail`).get(function () {
  return this.url.replace(`/upload`, `/upload/w_350`);
});

const CampgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    geometry: {
      type: {
        type: String,
        enum: [`Point`],
        required: true,
      },
      coordinates: {
        type: [Number],
        // required: true,
      },
    },
    description: String,
    location: String,
    images: [ImageSchema],
    owner: {
      type: Schema.Types.ObjectId,
      ref: `User`,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: `Review`,
      },
    ],
  },
  opts
);

CampgroundSchema.post(`findOneAndDelete`, async function (data) {
  if (data) {
    await Review.deleteMany({
      _id: {
        $in: data.reviews,
      },
    });
  }
});

CampgroundSchema.virtual(`properties.popUpMarkup`).get(function () {
  return `
  <strong><a style="text-decoration: none" href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 30)}...</p>
  `;
});

module.exports = mongoose.model(`Campground`, CampgroundSchema);
