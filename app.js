if (process.env.NODE_ENV !== `production`) {
  require("dotenv").config();
}
const express = require(`express`);
const path = require(`path`);
const mongoose = require(`mongoose`);
const methodOverride = require(`method-override`);
const ExpressError = require(`./utils/ExpressError`);
const ejsMate = require(`ejs-mate`);
const session = require(`express-session`);
const flash = require(`connect-flash`);
const passport = require(`passport`);
const localStrategy = require(`passport-local`);
const User = require(`./models/user`);

const userRoutes = require(`./routes/users`);
const campgroundRoutes = require(`./routes/campgrounds`);
const reviewRoutes = require(`./routes/reviews`);

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
app.use(express.static(path.join(__dirname, `public`)));

const sessionConfig = {
  secret: `thissecret`,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.curUser = req.user;
  res.locals.success = req.flash(`success`);
  res.locals.error = req.flash(`error`);
  next();
});

app.get(`/fakeUser`, async (req, res) => {
  const user = new User({ email: `colt@gmail.com`, username: `COLTTT` });
  const registeredUser = await User.register(user, `CHICKEN`);
  res.send(registeredUser);
});

app.use(`/campgrounds`, campgroundRoutes);
app.use(`/campgrounds/:id/review`, reviewRoutes);
app.use(`/`, userRoutes);

app.get(`/`, (req, res) => {
  res.render(`home`);
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
