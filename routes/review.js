const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsyc=require("../utils/wrapAsyc.js");
const Expresserror=require("../utils/Expresserror.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const { validatereview,isLoggedIn,isreviewAuthor } = require("../routes/middleware.js");
const reviewControllers=require("../controllers/reviews.js");



//reviews
//post
router.post("/",isLoggedIn,validatereview,wrapAsyc(reviewControllers.creteReview));
//delete review route
router.delete("/:reviewId",isLoggedIn,isreviewAuthor,wrapAsyc(reviewControllers.destroyReview));
module.exports=router;