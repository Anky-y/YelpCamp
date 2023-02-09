const mongoose = require(`mongoose`);
const Review = require(`./review`);
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  image: String,
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
