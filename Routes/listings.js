const express=require("express");
const router =express.Router();
const wrapAsync =require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {listingSchema,reviewSchema}=require("../schema");
const Listing =require("../models/listing");
const {isLoggedin,isOwner} =require("../middleware");
const {validateListing}=require("../middleware");


const listingController = require("../Controllers/listings");

//create a function for all our midllewares for better error handling & validate listing

const { storage } = require("../cloudConfig");
const multer = require("multer");
const upload = multer({ storage });


//Index Route & Create Route
router.route("/")
 .get(wrapAsync(listingController.index))
.post(  isLoggedin,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);


//{we need to first create the New Route Button bcz app.get think /listings/new is a Id or Search in the DataBase So,2}
//New Route
router.get("/new",isLoggedin,(listingController.renderNewForm));


//Show Route, Update Route, Delete Route
router.route("/:id")

.get(wrapAsync(listingController.showListing))

.put(isLoggedin,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))

.delete(isLoggedin,isOwner,wrapAsync(listingController.destroyListing))


  //Edit Route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.editListing));

module.exports=router;