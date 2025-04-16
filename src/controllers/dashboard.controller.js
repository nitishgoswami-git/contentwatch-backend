import mongoose, { isValidObjectId, mongo } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes, etc.  
    // Get channel_id from request  
    // Verify if channel_id is valid  
    // Match the given channel (user)  
    // Count total subscribers
    // Join videos based on owner (channel)  
    // Compute total videos and total views  
    // Join likes collection to compute total likes  
    // Return aggregated stats  

    const {channelId} = req.params 
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Not a valid Id")
    }
    
    const totalSubs = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "totalSubscribers"
        }
    ])

    if(totalSubs.length === 0 ){
        throw new ApiError(400, "Something went wrong while fetching subscribers")
    }

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },  // Count total videos
                totalViews: { $sum: "$views" }  // Sum views from videos
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { videoIds: "$_id" },  // Pass video IDs
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$video", "$$videoIds"] }  // Filter likes only for videos in this channel
                        }
                    },
                    {
                        $count: "totalLikes"
                    }
                ],
                as: "Likes"
            }
        },
        {
            $addFields: {
                totalLikes: { $ifNull: [{ $arrayElemAt: ["$Likes.totalLikes", 0] }, 0] }
            }
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1
            }
        }
    ]);
    
    
    if(!videoStats){
        throw new ApiError(400,"Something went wrong while fetching video stats")
    }

    const channelStats = {
        totalSubs : totalSubs[0]?.totalSubscribers || 0,
        totalLikes : videoStats[0]?.totalLikes || 0,
        totalViews : videoStats[0]?.totalViews || 0,
        totalVideos : videoStats[0]?.totalVideos || 0
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            channelStats,
            "Channel fetched Successfully"
        )
    )
    

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // Extract channelId from request
    // Validate channelId using ObjectId check
    // Match videos where owner == channelId
    // Join likes collection on video _id
    // Join comments collection on video _id
    // Add likesCount and commentsCount using $size
    // Project required fields (e.g., title, likesCount, commentsCount, etc.)
    // Return the response

    const {channelID} = req.params
    if(!isValidObjectId(channelID)){
        throw new ApiError(400, "Invalid ChannelId")
    }

    const channelVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelID)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "Likes",
                pipeline: [
                    {
                        $count: "Totallikes"
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            content: 1,
                            owner: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                description: 1,
                createdAt: 1,
                isPublished: 1,
                Likes: 1,
                comments: 1
            }
        }
    ]);
    
})

export {
    getChannelStats, 
    getChannelVideos
    }