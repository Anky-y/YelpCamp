const express = require(`express`);
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: `uploads/` });

const { isLoggedIn, isAuthor, validateCampground } = require(`../middleware`);

const campgrounds = require(`../controllers/campgrounds`);

router //pretier-ignore
  .route(`/`)
  .get(campgrounds.index)
  .post(isLoggedIn, validateCampground, campgrounds.createNewCampground);

router.get(`/new`, isLoggedIn, campgrounds.getNewForm);

router.get(`/:id/edit`, isLoggedIn, isAuthor, campgrounds.getEditForm);

router //pretier-ignore
  .route(`/:id`)
  .get(campgrounds.showCampground)
  .put(isLoggedIn, isAuthor, validateCampground, campgrounds.editCampground)
  .delete(isLoggedIn, isAuthor, campgrounds.deleteCampground);

module.exports = router;
