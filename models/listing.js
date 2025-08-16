const mongoose = require("mongoose");
const { Schema } = mongoose;

// (Optional) require review model if you plan to connect it
// const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true, // ✅ fixed
  },
  description: {
    type: String,
    required: true, // ✅ fixed
  },
  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60", // ✅ default fallback
    },
    filename: {
      type: String,
      default: "listingimage",
    },
  },
  price: {
    type: Number,
    required: true, // ✅ fixed
  },
  location: {
    type: String,
    required: true, // ✅ fixed
  },
  country: {
    type: String,
    required: true, // ✅ fixed
  },
});

const Listing = mongoose.model("Listing", listingSchema); // ✅ Capitalized model

module.exports = Listing;
