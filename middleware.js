const Listing=require("./models/listing.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review =require("./models/review.js");

module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // ✅ Only store redirectUrl if the request is GET
        if (req.method === "GET") {
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error", "You must be Logged In");
        return res.redirect("/login");
    }
    next(); // Pass control to the next handler
};



module.exports.saveRedirectUrl =(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async(req,res,next)=>{
    let {id}=req.params;
    let listing =await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You don't Have Permission to perform it");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.validateListing =(req,res,next)=>{
let {error}=listingSchema.validate(req.body);                     //we need to extract error so 
if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");    //also 1st extract actual error msg from it then map it (,)by comma 
    throw new ExpressError(400,errMsg); 
}
   else{
    next();
   }                                                            //if any error not occured then call next()
};

module.exports.validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);
            if(error){
                let errMsg=error.details.map((el)=>el.message).join(",");   //then use it app.post in review route
                throw new ExpressError(400,errMsg);
            }
            else{
                next();
          }
};

module.exports.isreviewAuthor = async(req,res,next)=>{
    let {id, reviewId}=req.params;
    let review =await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You don't Have Permission to perform it");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


