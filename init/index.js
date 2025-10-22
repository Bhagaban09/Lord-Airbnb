const mongoose = require("mongoose");
const axios = require("axios");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();

main()
  .then(() => {
    console.log("✅ Connected to DB");
  })
  .catch((err) => {
    console.log("❌ DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("🗑️ Old data cleared");

  for (let obj of initData.data) {
    obj.owner = "6872a1fd62db39065fbd3be5"; // fixed user id

    // ✅ Initialize geometry object
    obj.geometry = { type: "Point", coordinates: [0, 0] };

    if (obj.location) {
      try {
        const geoRes = await axios.get(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(obj.location)}.json`,
          { params: { key: process.env.MAPTILER_KEY } }
        );

        if (geoRes.data.features && geoRes.data.features.length > 0) {
          const coords = geoRes.data.features[0].geometry.coordinates; // [lng, lat]
          obj.geometry = {
            type: "Point",
            coordinates: coords
          };
          console.log(`📍 ${obj.title} → ${obj.location} → ${coords}`);
        } else {
          console.log(`⚠️ No geocode result for: ${obj.location}`);
        }
      } catch (err) {
        console.error("❌ Geocoding error for:", obj.location, err.message);
      }
    }

    const newListing = new Listing(obj);
    await newListing.save();
  }

  console.log("🎉 Data was initialized with geocoded locations");
  mongoose.connection.close();
};

initDB();
