const Review=require("../models/review.js");
const Listing =require("../models/listing.js");

module.exports.createReview = async(req,res)=>{
    let listing =await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
     req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview =async(req,res)=>{
    let{id, reviewId} =req.params;  //1st extraact id
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});           //then update the listing and also pull enire reviews in array
    await Review.findByIdAndDelete(reviewId);  //then find the id in review and delete
    console.log(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);

};

