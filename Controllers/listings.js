const Listing = require("../models/listing");
const axios = require("axios");

// Show all listings
module.exports.index = async (req, res, next) => {
  const alllistings = await Listing.find({});
  res.render("./listings/index.ejs", { alllistings });
};

// Render form to create a new listing
module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

// Create a new listing
module.exports.createListing = async (req, res, next) => {
  try {
    const url = req.file.path;
    const filename = req.file.filename;

    const NewListing = new Listing(req.body.listing);
    NewListing.owner = req.user._id;
    NewListing.image = { url, filename };

    // Geocode location string → convert to coordinates
    if (req.body.listing.location) {
      const geoRes = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json`,
        { params: { key: process.env.MAPTILER_KEY } }
      );

      if (geoRes.data.features && geoRes.data.features.length > 0) {
        NewListing.geometry = geoRes.data.features[0].geometry; // { type: "Point", coordinates: [lng, lat] }
      }
    }

    await NewListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${NewListing._id}`);
  } catch (err) {
    console.error("Error creating listing:", err.message);
    req.flash("error", "Could not create listing. Try again.");
    res.redirect("/listings/new");
  }
};

// Show a single listing
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested doesn't exist.");
    return res.redirect("/listings");
  }

  // Pass the API key into EJS for map rendering
  res.render("./listings/show.ejs", { listing, apiKey: process.env.MAPTILER_KEY });
};

// Render edit form for a listing
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested doesn't exist");
    return res.redirect("/listings");
  }

  let originalimageurl = listing.image.url.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, originalimageurl });
};

// Update a listing
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    // Update basic fields
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    // If a new image was uploaded
    if (req.file) {
      const url = req.file.path;
      const filename = req.file.filename;
      listing.image = { url, filename };
    }

    // If location changed, re-geocode
    if (req.body.listing.location) {
      const geoRes = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json`,
        { params: { key: process.env.MAPTILER_KEY } }
      );

      if (geoRes.data.features && geoRes.data.features.length > 0) {
        listing.geometry = geoRes.data.features[0].geometry; // { type: "Point", coordinates: [lng, lat] }
      }
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Error updating listing:", err.message);
    req.flash("error", "Could not update listing. Try again.");
    res.redirect("/listings");
  }
};

// Delete a listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted successfully!");
  res.redirect("/listings");
};
