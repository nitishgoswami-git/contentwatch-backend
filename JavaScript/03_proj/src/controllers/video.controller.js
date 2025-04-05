import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
 //TODO: get all videos based on query, sort, pagination
 const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
 console.log(userId);
 const pipeline = [];

 // for using Full Text based search u need to create a search index in mongoDB atlas
 // you can include field mapppings in search index eg.title, description, as well
 // Field mappings specify which fields within your documents should be indexed for text search.
 // this helps in seraching only in title, desc providing faster search results
 // here the name of search index is 'search-videos'
 if (query) {
     pipeline.push({
         $search: {
             index: "search-videos",
             text: {
                 query: query,
                 path: ["title", "description"] //search only on title, desc
             }
         }
     });
 }

 if (userId) {
     if (!isValidObjectId(userId)) {
         throw new ApiError(400, "Invalid userId");
     }

     pipeline.push({
         $match: {
             owner: new mongoose.Types.ObjectId(userId)
         }
     });
 }

 // fetch videos only that are set isPublished as true
 pipeline.push({ $match: { isPublished: true } });

 //sortBy can be views, createdAt, duration
 //sortType can be ascending(-1) or descending(1)
 if (sortBy && sortType) {
     pipeline.push({
         $sort: {
             [sortBy]: sortType === "asc" ? 1 : -1
         }
     });
 } else {
     pipeline.push({ $sort: { createdAt: -1 } });
 }

 pipeline.push(
     {
         $lookup: {
             from: "users",
             localField: "owner",
             foreignField: "_id",
             as: "ownerDetails",
             pipeline: [
                 {
                     $project: {
                         username: 1,
                         "avatar.url": 1
                     }
                 }
             ]
         }
     },
     {
         $unwind: "$ownerDetails"
     }
 )

 const videoAggregate = Video.aggregate(pipeline);

 const options = {
     page: parseInt(page, 10),
     limit: parseInt(limit, 10)
 };

 const video = await Video.aggregatePaginate(videoAggregate, options);

 return res
     .status(200)
     .json(new ApiResponse(200, video, "Videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    // get title and description from req.body
    // verify if empty
    // get user_id
    // upload to cloudinary
    // create video obj 
    // check for db entry
    // remove localfile path
    // return res
    
    const { title, description} = req.body
    if([title,description].some((field)=>
        field?.trim() == "")){
            throw new ApiError(400, "All Fields are required")
        }
    const user = await User.findOne(req.user?._id)
    if(!user){
        throw new ApiError("User Not Found")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!(videoLocalPath || thumbnailLocalPath)){
        throw new ApiError(400, "All fields are required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!(videoFile || thumbnail)){
        throw new ApiError(400,"Something went wrong while uploading")
    }

    const video = await Video.create({
        videoFile : videoFile.url,
        thumbnail : thumbnail.url,
        owner : req.user?._id,
        title,
        description,
        duration: videoFile.duration,
        views: 0,
        isPublished : true
    })
    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    //  get video id
    //  verfiy video id
    //  find video 
    //  get likes
    //  get comments
    //  send res
    
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not a valid Id")
    }

    const videoDetails = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(videoId)                
            }
        },
        {
            $lookup:{
                from :"likes",
                localField:"_id",
                foreignField:"video",
                as:"Likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"video",
                as:"comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                owner: 1,
                createdAt: 1,
                likesCount: 1,
                commentsCount: 1,
                comments: 1,
            },
        },
    ]);

    if(!videoDetails){
        throw new ApiError(400,"something went wrong while fetching video")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            videoDetails,
            "video fetched successfully"
        )
    )
    
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    //  get title, description, thumbnail, video_id
    //  verify video_id
    //  verify if empty
    //  find the video
    //  verify user is owner of the video
    //  update 
    //  return res
    
    const { videoId } = req.params
    const {title, description} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Not a valid Id")
    }

    if([title,description].some((field)=>
        field?.trim() == "")){
            throw new ApiError(400, "All Fields are required")
    }

    const videoFile = await Video.findById(videoId)
    if(videoFile.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not the owner")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "File not found")
    }

    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!newThumbnail){
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title,
                description,
                thumbnail : newThumbnail?.url
            }

        },{new: true})

    if(!updatedVideo){
        throw new ApiError(500, "Something went wrong while updating")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "video updated successfully"
        )
    )
    })

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    //  get video_id 
    //  verify video_id
    //  find the video
    //  verify if user is owner
    //  delete the video
    //  delete the comments
    //  return res
    const { videoId } = req.params
})

const togglePublishStatus = asyncHandler(async (req, res) => {
     // get video_id
     // verify video_id
     // find the video
     // verify if owner == user
     // !video.isPublished
     // return res
    
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Video Id is Required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Not a valid video Id")
    }

    const videoFile = await Video.findById({videoId})
    if(!videoFile){
        throw new ApiError(400 , "Video not Found")
    }
    if(videoFile.owner.toString() !== req.user?._id){
        throw new ApiError(403, "You are not the owner")
    }
    const status = await Video.findByIdAndUpdate(videoId,
        {

            $set:{
                isPublished: !videoFile?.isPublished 
            }
    },{new:true})
    
    if(!status){
        throw new ApiError(500, "Unable to toggle status")
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            status,
            `Video is now ${status.isPublished}`
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}