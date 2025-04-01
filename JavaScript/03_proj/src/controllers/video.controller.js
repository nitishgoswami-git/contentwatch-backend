import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

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
    const { videoId } = req.params
    //TODO: get video by id
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
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}