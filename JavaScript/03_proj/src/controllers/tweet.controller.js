import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // get content and user from req
    // verify for empty content
    // create obj 
    // check for creation 
    // return res
    const {content} = req.body
    const user = req?.user._id
    
    if(!content?.trim()){
        throw new ApiError(400,"content is required")
    }
    const userTweet = await Tweet.create({
        owner : user,
        content : content
    })

    if(!userTweet){
        throw new ApiError(500, "Something went wrong while creating tweet")
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            userTweet,
            "Tweet posted"
        )
    )
})

// const getUserTweets = asyncHandler(async (req, res) => {
//     // get user_id from req.body
//     // create pipeline on tweets model that match owner = user_id
//     //
    
//     const userTweets = await Tweet.aggregate([
//         {
//             $match : { // match the user with user_id
//                 owner : new mongoose.Types.ObjectId(req.user._id)

//             }
//         },
//         {
//             $lookup:{
//                 from : ""
//             }
//         }
//     ])
// })

const updateTweet = asyncHandler(async (req, res) => {
    // get tweet_id from req.params
    // get content 
    // find the tweet
    // verify the owner
    // update tweet
    // send res

    const {tweetId} = req.params 
    const {content} = req.body 

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }


    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "Tweet not found")
    }

    if(tweet?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not the owner")
    }

    const newTweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content
        }
        },{
            new: true
        }
    )

    if(!newTweet){
        throw new ApiError(500, "Failed to update tweet")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            newTweet,
            "Tweet updated Successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    // get tweet_id from req.params
    // find the tweet
    // verify the owner
    // delete tweet
    // send res

    const {tweetId} = req.params 

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "Tweet not found")
    }

    if(tweet?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not the owner")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(404, "Failed to deleted");
    }

    return res.status(200)
    .json(new ApiResponse(
        200,
        {tweetId},
        "tweet Deleted"
    ))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}