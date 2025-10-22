const express=require("express");
const router =express.Router({mergeParams: true});
const wrapAsync =require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {listingSchema,reviewSchema}=require("../schema");
const Review=require("../models/review.js");
const Listing =require("../models/listing");
const {validateReview, isLoggedin,isreviewAuthor}=require("../middleware.js");

const reviewController=require("../Controllers/reviews.js");

//Reviews Route
//Post Route 
router.post("/",
    isLoggedin,
    validateReview,wrapAsync(reviewController.createReview));

//Delete Review Route

router.delete("/:reviewId",
    isLoggedin,
    isreviewAuthor,
    wrapAsync(reviewController.destroyReview));

module.exports=router;