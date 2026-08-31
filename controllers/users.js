const User=require("../models/user");
const Review = require("../models/review");   // ✅ ADD THIS
const Listing = require("../models/listing");
const Booking = require("../models/booking.js");
 // ✅ ADD THIS
module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
}
module.exports.signup=async(req,res)=>{
    try{
         let {username,email,password}=req.body;
    const newUser=new User({email,username});
  const registeredUser= await User.register(newUser,password);
  console.log(registeredUser);
  req.login(registeredUser,(err)=>{
    if(err){
        return next(err);
    }
     req.flash("success","Welcome to wanderlust!");
  res.redirect("/listings");

  })

    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");

    }

}

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login=async(req,res)=>{
    req.flash("success","welcome back to wanderlust");
    let redirect= res.locals.redirectUrl|| "/listings";
    res.redirect(redirect);

}
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
          return  next(err);

        }
        req.flash("success","you are logged out")
        res.redirect("/listings")
    })
}
module.exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete all reviews written by user
    await Review.deleteMany({ author: userId });

    // Delete all bookings by user
    await Booking.deleteMany({ user: userId });

    // Delete all listings created by user
    await Listing.deleteMany({ owner: userId });

    // Delete user itself
    await User.findByIdAndDelete(userId);

    req.logout(function (err) {
      if (err) return next(err);

      req.flash("success", "Your account has been deleted.");
      return res.redirect("/listings");
    });

  } catch (err) {
    next(err);
  }
};



// ✅ PROFILE PAGE


module.exports.profilePage = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "bookings",
      populate: { path: "listing" }
    });

  res.render("users/profile.ejs", { user });
};
