const mongoose = require(`mongoose`);
const Review = require(`./review`);
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual(`thumbnail`).get(function () {
  return this.url.replace(`/upload`, `/upload/w_350`);
});
const CampgroundSchema = new Schema({
  title: String,
  price: Number,
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
});

CampgroundSchema.post(`findOneAndDelete`, async function (data) {
  if (data) {
    await Review.deleteMany({
      _id: {
        $in: data.reviews,
      },
    });
  }
});

module.exports = mongoose.model(`Campground`, CampgroundSchema);
