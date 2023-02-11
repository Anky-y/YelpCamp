const express = require(`express`);
const router = express.Router();

const passport = require(`passport`);
const users = require(`../controllers/users`);

router //prettier-ignore
  .route(`/register`)
  .get(users.getRegisterForm)
  .post(users.register);

router //prettier-ignore
  .route(`/login`)
  .get(users.getLoginForm)
  .post(passport.authenticate(`local`, { failureFlash: true, failureRedirect: `/login`, keepSessionInfo: true }), users.login);

router.get(`/logout`, users.logout);

module.exports = router;
