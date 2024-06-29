import mongoose from "mongoose";
// here why not import usermodel , as we have used user here also
const conversationModel = new mongoose.Schema({
    chatName:{
        type:String,
        default:"New Group"
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }], 
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }]
    
    
},{timestamps:true});
 
export const Conversation = mongoose.model("Conversation",conversationModel);