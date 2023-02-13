const User = require(`../models/user`);
const catchAsync = require(`../utils/catchAsync`);

module.exports.getRegisterForm = (req, res) => {
  res.render(`users/register`);
};

module.exports.register = catchAsync(async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash(`success`, `Welcome to Yelp Camp`);
      res.redirect(`/campgrounds`);
    });
  } catch (e) {
    req.flash(`error`, e.message);
    res.redirect(`/register`);
  }
});

module.exports.getLoginForm = (req, res) => {
  res.render(`users/login`);
};

module.exports.login = async (req, res) => {
  req.flash(`success`, `Welcome! :)`);
  const redirectUrl = req.session.returnTo || `/campgrounds`;
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = async (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else req.flash(`success`, `Successfully logged out`);
    res.redirect(`/campgrounds`);
  });
};
