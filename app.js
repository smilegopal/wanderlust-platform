const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// -------------------- Database Connection --------------------
main()
  .then(() => {
    console.log("✅ Connected to DB");
  })
  .catch((err) => {
    console.log("❌ DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// -------------------- Middleware --------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // serve css/js/images

// -------------------- Routes --------------------

// Home route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// INDEX route
app.get("/listings", async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("listings/index.ejs", { alllistings });
});

// NEW route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// SHOW route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.send("Listing not found");
  }
  res.render("listings/show.ejs", { listing });
});

// CREATE route
app.post("/listings", async (req, res) => {
  let { listing } = req.body;

  // ✅ Handle image safely
  let imageData = {};
  if (
    listing.image &&
    typeof listing.image === "string" &&
    listing.image.trim() !== ""
  ) {
    imageData = { url: listing.image, filename: "uploaded" };
  }

  const newListing = new Listing({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    country: listing.country,
    image: imageData,
  });

  await newListing.save();
  res.redirect("/listings");
});

// EDIT route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.send("Listing not found");
  }
  res.render("listings/edit.ejs", { listing });
});

// UPDATE route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let { listing } = req.body;

  // Find existing listing
  const existingListing = await Listing.findById(id);
  if (!existingListing) {
    return res.send("Listing not found");
  }

  // ✅ Keep old image if no new one provided
  let imageData = existingListing.image;
  if (
    listing.image &&
    typeof listing.image === "string" &&
    listing.image.trim() !== ""
  ) {
    imageData = { url: listing.image, filename: "uploaded" };
  }

  await Listing.findByIdAndUpdate(id, {
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    country: listing.country,
    image: imageData,
  });

  res.redirect(`/listings/${id}`);
});

// DELETE route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedlisting = await Listing.findByIdAndDelete(id);
  console.log("Deleted:", deletedlisting);
  res.redirect("/listings");
});

// -------------------- Server --------------------
app.listen(8080, () => {
  console.log("🚀 Server is listening on port 8080");
});
