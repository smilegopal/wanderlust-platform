const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review=require("./review.js")

// (Optional) require review model if you plan to connect it
// const Review = require("./review.js");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  image: {
    url: String,
    filename: String,
  },

  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },

  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },

  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    }
  ],

  // ⭐ Soft delete flag
  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  },

  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
  },

  category: {
    type: String,
    enum: ["Trending", "Rooms", "Iconic cities", "Castles", "Restaurant"],
    required: true,
  }
});

//mongoose middleware
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
     await Review.deleteMany({_id:{$in:listing.reviews}})

  }
 

})

const Listing = mongoose.model("Listing", listingSchema); // ✅ Capitalized model

module.exports = Listing;