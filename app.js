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
const mongoSanitize = require(`express-mongo-sanitize`);

const userRoutes = require(`./routes/users`);
const campgroundRoutes = require(`./routes/campgrounds`);
const reviewRoutes = require(`./routes/reviews`);

const MongoDBStore = require("connect-mongo")(session);

const helmet = require(`helmet`);
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

mongoose.set("strictQuery", true);

// "mongodb://127.0.0.1:27017/yelp-camp"
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
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
app.use(mongoSanitize());

const store = new MongoDBStore({
  url: dbUrl,
  secret: `thissecret`,
  touchAfter: 24 * 60 * 60,
});

store.on(`error`, function (e) {
  console.log(`Session Store Error!`);
});

const secret = process.env.SECRET || `thissecret`;

const sessionConfig = {
  store,
  name: `session`,
  secret: `thissecret`,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
const scriptSrcUrls = ["https://stackpath.bootstrapcdn.com/", "https://api.tiles.mapbox.com/", "https://api.mapbox.com/", "https://kit.fontawesome.com/", "https://cdnjs.cloudflare.com/", "https://cdn.jsdelivr.net", "https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js"];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css",
  "https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.css",
];
const connectSrcUrls = ["https://api.mapbox.com/", "https://a.tiles.mapbox.com/", "https://b.tiles.mapbox.com/", "https://events.mapbox.com/", "https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js "];
const fontSrcUrls = [];
app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/da6kxltkj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://cdn.sanity.io",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

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
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`On port ${port}`);
});
