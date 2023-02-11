const mongoose = require(`mongoose`);
const Campground = require(`../models/campground`);
const cities = require(`./cities`);
const { places, descriptors } = require(`./seedHelpers`);
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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const rand1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: `https://source.unsplash.com/collection/483251`,
      description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti vitae corporis voluptatibus harum nostrum? Esse sint voluptatibus dolorum, quis repellendus rem impedit facere ad, expedita qui animi perferendis illo id.`,
      price,
      owner: `63e66e160b28676ce0336d26`,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
