const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalmongoose = require("passport-local-mongoose");
const Listing = require("./listing");
const Booking = require("./booking");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Gmail address!`,
    },
  },

  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    }
  ],

  isHost: {
    type: Boolean,
    default: false
  }
});

// ✅ Cascade delete — remove listings + bookings when a user is deleted
userSchema.pre("findOneAndDelete", async function(next) {
  const user = await this.model.findOne(this.getQuery());

  if (user) {
    await Listing.deleteMany({ owner: user._id });
    await Booking.deleteMany({ user: user._id });
  }

  next();
});

userSchema.plugin(passportLocalmongoose);

module.exports = mongoose.model("User", userSchema);
