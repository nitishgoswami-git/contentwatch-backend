import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    //  get title and desc
    //  verify if empty
    //  create playlist obj
    //  return res

    const {name, description} = req.body

    if(!(name||description)){
        throw new ApiError(400,"All fields are required")
    }

    const playlist = await Playlist.create(
        {
            name,
            description,
            owner : req.user?._id
        }
    )
    if(!playlist){
        throw new ApiError(400, "Something went wrong while creating playlist")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist created"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //  get video_id
    //  get playlist id
    //  verfiy playlist and video ids
    //  find playlist
    //  find video
    //  add video to playlist
    //  return res

    const {playlistId, videoId} = req.params
    if(!(isValidObjectId(playlistId)||isValidObjectId(videoId))){
        throw new ApiError(400,"Invalid playlist or video id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"You are not authorized")
    }
    const addedVideoToPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos: videoId
        }
    },{new: true})

    if(!addVideoToPlaylist){
        throw new ApiError(400, "Unable to add video to playlist")
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            addVideoToPlaylist,
            "Video added to playlist"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    //  get playlist_id and video_id
    //  verify ids
    //  find playlist 
    //  verify if owner == user
    //  remove video
    //  return res
    
    const {playlistId, videoId} = req.params
    if(!(isValidObjectId(playlistId) || isValidObjectId(videoId))){
        throw new ApiError(400, "Not a valid Id")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You are not Authorized")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos:videoId
        }
    },{new:true})

    if(!updatedPlaylist){
        throw new ApiError(400, "Unable to delete videos")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    //  get playlist Id 
    //  verify id
    //  find playlist
    //  verify owner == req.user
    //  delete
    //  return res

    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, " Invalid id")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, " Playlist not found")
    }

    if(playlist.owner.toString !== req.user?._id){
        throw new ApiError(400,"You are not Authorized")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(400, " Unable to delete Playlist")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            deletedPlaylist,
            "Playlist deleted"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    //  get playlist id
    //  name and description
    //  verify playlist id
    //  find playlist
    //  verify owner == user
    //  updated playlist
    //  return res

    const {playlistId} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Not a valid Id")
    }

    if (!(name || description)){
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"You are not Authorized")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }
    },{new : true})

    if(!updatedPlaylist){
        throw new ApiError(400, "Unable to update Playlist")
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}