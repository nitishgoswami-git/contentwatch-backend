import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    //  get video_id
    //  get content
    //  verify video_id
    //  verify content not empty
    //  get user_id
    //  create obj 
    //  return res

    const {video_id} = req.params
    const {content} = req.body

    if(!isValidObjectId(video_id)){
        throw new ApiError(400,"Not a valid video_id")
    }

    if(!content){
        throw new ApiError(400, "Content is required")
    }
    const comment = await Comment.create(
        {
            content,
            video: video_id,
            owner: req.user?._id
        }
    )
    if(!comment){
        throw new ApiError(400,"Something went wrong comment not added")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment added"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    //  get comment id
    //  get newcontent
    //  verify comment id
    //  find the comment document
    //  verify owner == user
    //  update the comment
    //  return res

    const {commentId} = req.params
    const {newContent} = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Not a valid comment id")
    }
    
    if(!newContent){
        throw new ApiError(400, "Content cannot be empty")
    }
    const commentFile = await Comment.findById(commentId)
    if(!commentFile){
        throw new ApiError(400, "Comment not found")
    } 
    if(commentFile.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to edit ")
    }
    const newComment = Comment.findByIdAndUpdate(commentId,{
        $set:{
            content: newContent
        }
    },{new:true})

    if(!newComment){
        throw new ApiError(400, "Something went wrong while updating")
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            newComment,
            "Comment Updated"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    //  get comment id
    //  verify comment id
    //  find comment document
    //  verify if owner == user
    //  delete comment and likes 
    //  return res

    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Not a valid Comment id")
    }

    const commentFile = await Comment.findById(commentId)
    if(!commentFile){
        throw new ApiError(400, "Comment not found")
    }

    if(commentFile.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not the owner")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if(!deletedComment){
        throw new ApiError(400,"Something went wrong while deleting")
    }
    await Like.deleteMany({
        comment: commentId,
    })

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "operation successfull"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }