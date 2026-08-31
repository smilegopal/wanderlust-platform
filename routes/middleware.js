const Listing=require("../models/listing");
const Review=require("../models/review");
const Expresserror=require("../utils/Expresserror.js");
const {listingschema,reviewSchema}=require("../schema.js");


module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in!");
        return res.redirect("/login");

    }
    next();
};
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner= async(req,res,next)=>{
     let { id } = req.params;
  
  const existingListing = await Listing.findById(id);
   if (!existingListing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  if (!existingListing.owner || !existingListing.owner.equals(res.locals.currUser._id)) {
    req.flash("error","you are not owner of this listingst")
  return  res.redirect(`/listings/${id}`)
  }
  next();
}
module.exports.validatelisting=(req,res,next)=>{
  let {error}=listingschema.validate(req.body);
  if(error){
    let errmessage=error.details.map((el)=>el.message).join(",");
    throw new Expresserror(400,errmessage);
  }else{
    next();
  }

};
module.exports. validatereview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
    let errmessage=error.details.map((el)=>el.message).join(",");
    throw new Expresserror(400,errmessage);
  }else{
    next();
  }

};
module.exports.isreviewAuthor= async(req,res,next)=>{
     let {id, reviewId } = req.params;
  
  const review = await Review.findById(reviewId);
   

  if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error","you are not author of this reveiw")
  return  res.redirect(`/listings/${id}`)
  }
  next();
}