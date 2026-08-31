const Review = require("../models/review");
const Listing = require("../models/listing");


module.exports.creteReview=async(req,res)=>{
 let listing=await Listing.findById(req.params.id);
 let newreview=new Review(req.body.review);
 newreview.author=req.user._id;
 listing.reviews.push(newreview.id);
 await newreview.save();
 await listing.save({ validateModifiedOnly: true });   // ✅ FIX
 req.flash("success", "New Review created!");
 res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview=async(req,res)=>{
  let {id,reviewId}=req.params;
  Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review  Deleted!");
  res.redirect(`/listings/${id}`)
}
