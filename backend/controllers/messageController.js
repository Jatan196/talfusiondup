import {Conversation} from "../models/conversationModel.js";
import { Message} from "../models/messageModel.js"
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage= async (req,res)=>{

    try{
        const senderId=req.id; // isauthenticated acted as middlewware between req and response
        const receiverId=req.params.id; // params will give id of reciver( see in msgroute.)

        const {message}=req.body;
        // first we'll generate conversation , and then store msg
        
        let gotConversation=await Conversation.findOne({// we'll update this , so its not "const"
            participants:{$all : [senderId, receiverId]} // it will find all converstaio with this paritcular arrya of participants
        })

        if(!gotConversation){ 
            // no prior convs. found then create new onelll
            gotConversation=await Conversation.create({
                participants:[senderId,receiverId]
            })
        }
        
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        })
        if(newMessage){
            gotConversation.messages.push(newMessage._id);
        }
        

        await Promise.all([gotConversation.save(),newMessage.save()]);// why??
        // SOCKET IO
        const receiverSocketId=getReceiverSocketId(receiverId);

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage); // io.to will give msg to all recievers ( means can be for group chat)
        }

        return res.status(201).json({
            newMessage
        });
    }
    catch(error){
        console.log(error);
    }
} 
export const getMessage = async(req,res)=>{
    // console.log("at backend-->");
    //     console.log(req.id);
    try{
        const receiverId=req.params.id; 
        const senderId=req.id;

        // we'll bring (get message) from database only those msg
        // which is in between this particular set of participants by accessing  messageids from message array of conversation
        const conversation=await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate("messages");
        // populate is a method which returns messages from msg id
      //  console.log(conversation);
        // const msgArray=conversation.messages;
        // console.log(msgArray);   
        return res.status(200).json(conversation?.messages); 
    } 
    catch(error){
    
        console.log(error);
    }
}