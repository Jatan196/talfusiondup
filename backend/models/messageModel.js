import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId, // it is like the primary key of RDBMS , we will requerst user model to give id to that user

        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId, // it is like the primary key of RDBMS , we will requerst user model to give id to that user

        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:true
    }

    
},{timestamps:true});
export const Message = mongoose.model("Message",messageModel);