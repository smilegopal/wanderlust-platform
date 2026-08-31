const express = require("express");
const router = express.Router();
const wrapAsyc = require("../utils/wrapAsyc.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validatelisting } = require("./middleware.js");
const ListingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsyc(ListingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsyc(ListingController.creteListings)
  );

// NEW route
router.get("/new", isLoggedIn, ListingController.renderNewform);

// ✅ BOOK FIRST
router.post("/:id/book", isLoggedIn, wrapAsyc(ListingController.bookListing));

router
  .route("/:id")
  .get(wrapAsyc(ListingController.showListings))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsyc(ListingController.updateListings)
  )
  .delete(isLoggedIn, isOwner, wrapAsyc(ListingController.destroyListing));

// EDIT route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsyc(ListingController.editListing));

module.exports = router;
