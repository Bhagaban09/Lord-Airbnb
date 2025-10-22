const { string } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;



//Schema Define for Our Reviews

const reviewSchema =new Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});
//Define it
const Review = mongoose.model("Review", reviewSchema);

//Exports it
module.exports = Review;