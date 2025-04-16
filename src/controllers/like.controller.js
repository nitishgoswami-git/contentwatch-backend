import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    //  get video_id
    //  verify video_id
    //  find video where likedBy == user_id
    //  if not liked likedBy = user_id else delete
    //   return res

    const {videoId} = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Not a valid Video Id")
    }
    
    const videoFile = await Like.findOne(
        {
            video : videoId,
            likedBy : req.user?._id
        }
    )

    let status
    if(!videoFile){
        status = await Like.create({
            video : videoId,
            likedBy : req.user?._id 
        })
    }
    else{
        status = await Like.findByIdAndDelete(videoFile?._id)
    }

    return res.status(200)
    .json(
        new ApiResponse(
                200,
                {status},
                "operation successfull"
            
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    //  get comment_id
    //  verify comment_id
    //  find comment where likedBy == user_id
    //  if not liked likedBy = user_id else delete
    //   return res

    const {commentId} = req.params
    
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Not a valid Video Id")
    }
    
    const commentFile = await Like.findOne(
        {
            comment : commentId,
            likedBy : req.user?._id
        }
    )

    let status
    if(!commentFile){
        status = await Like.create({
            comment : commentId,
            likedBy : req.user?._id 
        })
    }
    else{
        status = await Like.findByIdAndDelete(commentFile?._id)
    }

    return res.status(200)
    .json(
        new ApiResponse(
                200,
                {status},
                "operation successfull"
            
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    //  get tweet_id
    //  verify tweet_id
    //  find tweet where likedBy == user_id
    //  if not liked likedBy = user_id else delete
    //   return res

    const {tweetId} = req.params
    
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Not a valid Video Id")
    }
    
    const tweetFile = await Like.findOne(
        {
            tweet : tweetId,
            likedBy : req.user?._id
        }
    )

    let status
    if(!tweetFile){
        status = await Like.create({
            tweet : tweetId,
            likedBy : req.user?._id 
        })
    }
    else{
        status = await Like.findByIdAndDelete(tweetFile?._id)
    }

    return res.status(200)
    .json(
        new ApiResponse(
                200,
                {status},
                "operation successfull"
            
        )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //  TODO: get all liked videos
    // Extract user_id from request
    // Match all documents in the 'likes' collection where likedBy == user_id
    // Perform a $lookup to join the 'videos' collection on the video field
    // Unwind the joined video array to flatten the structure
    // Project and return only the relevant video fields (e.g., title, thumbnail, etc.)

    const {userId} = req.user?._id
    if(!userId){
        throw new ApiError(400,"User Id not received")
    }
    const likedVideos = await Like.aggregate([
        {
          $match: {
            likedBy: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "LikedVideos",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  "videoFile.url": 1,
                  "thumbnail.url": 1,
                  owner: 1,
                  title: 1,
                  description: 1,
                  duration: 1,
                  views: 1,
                  createdAt: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$LikedVideos",
        },
        {
          $replaceRoot: {
            newRoot: "$LikedVideos",
          },
        },
      ]);
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked Videos Fetched Successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}