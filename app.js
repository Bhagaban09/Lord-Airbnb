// Load environment variables from .env file only in development mode
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app=express();
const path=require("path");
const mongoose= require("mongoose");
const port=8080;
const Listing =require("./models/listing");
const listing = require("./models/listing");
const methodOverride =require("method-override"); //after require it then use app.use(method-override)
const ejsMate =require("ejs-mate");  //after require it then use app.engine("ejs",ejsMate);
const wrapAsync =require("./utils/wrapAsync"); // for wrapAsync create a utils folder then create a wrapAsync.js then require for our error handler
const ExpressError=require("./utils/ExpressError");
const {listingSchema,reviewSchema}=require("./schema"); //Now for server side schema validation 1st we need to install npm i joi then require..... 
const Review=require("./models/review.js");

const session =require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");

const listingsRouter =require("./Routes/listings.js"); //for craeting listings.js & review.js for our restructuring
const ReviewsRouter=require("./Routes/reviews.js");
const userRouter=require("./Routes/user.js");

const passport =require("passport");
const LocalStrategy=require("passport-local");
const User =require("./models/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


//Data base Connect

main().then(()=>{
    console.log("Connected to Db");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB Atlas");
    console.error(err);
  }
}

main();

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // corrected
});

store.on("error", (err) => {
  console.log("MongoStore Error:", err);
});


store.on("error",()=>{
    console.log("Error in Mongosesion Store ",err)
})
//Using of Seesion
const sessionOptions ={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};



// Use session and flash
app.use(session(sessionOptions));
app.use(flash());

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport to use local strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Global middleware to make currUser & flash messages available in all EJS templates
app.use((req, res, next) => {
  res.locals.currUser = req.user;          // Logged-in user (if any)
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ✅ Your route handlers
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", ReviewsRouter);
app.use("/", userRouter);


//for no page found

app.all(/.*/, (req, res, next) => {  //2
  next(new ExpressError(404,"Page Not Found")); // after make all to wrapAsync then ExpressError.js 3
});


//Error Handler    after define  also put it to try{} catch(err) app.post

app.use((err,req,res,next)=>{  //1
    let {statusCode=500,message="Something went wrong"}=err;                           //first deconstruct then send res.send(statusCode)
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
})


//Now for server side schema validation 1st we need to install npm i joi then require..... 5

app.listen(8080,()=>{
    console.log("Server is listening to 8080");
})
