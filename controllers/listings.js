const Booking = require("../models/booking.js");
const User = require("../models/user");

const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
  const { q, category } = req.query;

  let filter = { isDeleted: false };  // ⬅ ADD THIS

  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { title: regex },
      { location: regex },
      { country: regex }
    ];
  }

  if (category) {
    filter.category = category;
  }

  const alllistings = await Listing.find(filter);
  res.render("listings/index.ejs", { alllistings, q, category });
};


module.exports.renderNewform=(req, res) => {
   res.render("listings/new.ejs");
}
module.exports.showListings = async (req, res, next) => {
  let { id } = req.params;

  const listing = await Listing.findOne({ _id: id, isDeleted: false })

    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // ✅ Get all bookings for this listing
  const bookingData = await Booking.find({ listing: id })
    .populate("user");

  res.render("listings/show.ejs", {
    listing,
    bookingData,
  });
};

module.exports.creteListings=async (req, res, next) => {
 let response=await geocodingClient.
 forwardGeocode({
   query: req.body.listing.location,
  limit: 1,
})
  .send();
 

 
  let url=req.file.path;
  let filename=req.file.filename;
 
 
  const newListing = new Listing(req.body.listing);

  newListing.owner=req.user._id;
  newListing.image={url,filename};
  newListing.geometry=response.body.features[0].geometry;
  newListing.category = req.body.listing.category;


 let savedListing= await newListing.save();
  await User.findByIdAndUpdate(req.user._id, { isHost: true });

 console.log(savedListing);

  req.flash("success", "New listing created!");
  res.redirect("/listings");

}
module.exports.editListing=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
      req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let orginalimageUrl=listing.image.url;
 orginalimageUrl= orginalimageUrl.replace("/upload","/upload/,w_250");
  
  res.render("listings/edit.ejs", { listing,orginalimageUrl });
}
module.exports.updateListings=async (req, res) => {
  
  let { id } = req.params;
  //new add
  const geoData = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();



  let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
  listing.category = req.body.listing.category;
  // new add
   listing.geometry = {
    type: "Point",
    coordinates: geoData.body.features[0].geometry.coordinates,
  };


  if(typeof req.file!=="undefined"){
  let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  // await listing.save();
  }
  //new add
   await listing.save();
  
  req.flash("success", " listing Updated!");

  res.redirect(`/listings/${id}`);
}
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // ✅ Correct soft delete fields
  listing.isDeleted = true;
  listing.deletedAt = new Date();
  await listing.save();

  req.flash("success", "Listing removed (soft delete). Booking history preserved.");
  res.redirect("/listings");
};

module.exports.bookListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing!");
    return res.redirect(`/listings/${id}`);
  }

  const booking = new Booking({
    user: req.user._id,
    listing: id
  });

  await booking.save();

  // ✅ Add booking to User
  req.user.bookings.push(booking._id);
  await req.user.save();

  // ✅ Add booking to Listing
  listing.bookings.push(booking._id);
  await listing.save();

  req.flash("success", "Booking confirmed!");
  res.redirect(`/listings/${id}`);
};

module.exports.hostBookings = async (req, res) => {
  const hostId = req.user._id;

  // ✅ Get listings by host
  const listings = await Listing.find({ owner: hostId, isDeleted: false });


  const listingIds = listings.map(l => l._id);

  // ✅ Populate user + listing
  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate("user")     // ✅ guest user info
   .populate({
  path: "listing",
  match: { isDeleted: false }
});
 // ✅ listing info

  res.render("users/hostBookings.ejs", { bookings });
};
