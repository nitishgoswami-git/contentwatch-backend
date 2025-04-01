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
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}