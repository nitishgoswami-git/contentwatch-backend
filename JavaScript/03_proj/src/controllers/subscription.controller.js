import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    // Get channelId from req.params or req.body
    // Validate channelId using isValidObjectId()
    // Find the channel in the DB using Channel.findById()
    // Check if a Subscription exists where subscriber == req.user._id and channel == channelId
    //  - If it exists → unsubscribe (delete the doc)
    //  - If it doesn't exist → subscribe (create a new doc)
    // Return appropriate response
    
    let subscription;

    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Not a valid channel Id")
    }

    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"Channel Not Found")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed?._id)
        subscription = false
    }else{
        await Subscription.create({
            subscriber : req.user?._id,
            channel : channelId
        })
        subscription = true
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {subcribed: `${subscription}`},
            "Operation Successfull"
        )
    )
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // TODO: return subscriber list of a channel
    // Get userId (channel owner) from req.params
    // Validate userId using isValidObjectId
    // Match subscriptions where channel == userId (channel's _id)
    // Lookup subscriber details from the "users" collection
    // Project relevant user info (e.g., username, fullName, avatar)
    // Return the list of subscribers

    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Not a valid Id")
    }
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"Channel not Found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "subscribers fetched successfully"
            )
        );
});


const getSubscribedChannels = asyncHandler(async (req, res) => {
    // TODO: return channel list to which user has subscribed
    // Extract userId from the request (e.g., req.user._id)
    // Validate userId using isValidObjectId
    // Match subscriptions where subscriber == userId
    // Lookup channel details from the 'users' collection using channel == _id
    // (Optional) Lookup mutual subscription from 'subscriptions' collection
    // Unwind the channel array to flatten the result
    // Project only required fields (e.g., _id, username, avatar, etc.)
    // Return the final list of subscribed channels in the response

    const { subscriberId } = req.params
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                        },
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannel",
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "subscribed channels fetched successfully"
            )
        );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}