import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js"
import { getReceiverSocketIdChat, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {

    try {
        const senderId = req.id; // isauthenticated acted as middlewware between req and response
        const conversationId = req.params.id; // params will give id of reciver( see in msgroute.)

        const { message } = req.body;
        // first we'll generate conversation , and then store msg

        let gotConversation = await Conversation.findById(conversationId);
    

        const newMessage = await Message.create({
            senderId,
            conversationId,  
            message
        })
        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
        }


        await Promise.all([gotConversation.save(), newMessage.save()]);// why??
        // SOCKET IO
        const participantsOfConvo = await Conversation.findById(conversationId).populate("participants");

        console.log(participantsOfConvo.participants);
        if (participantsOfConvo.participants.length == 2) {
            const receiverId = participantsOfConvo.participants
                .filter(user => user._id.toString() !== senderId.toString())
                .map(user => user._id);
            console.log(receiverId);
            const receiverSocketId = getReceiverSocketIdChat(receiverId[0]);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage); // io.to will give msg to all recievers ( means can be for group chat)
                }
        }
        else {
            const receiversSocketId = participantsOfConvo.participants
                .filter(participant => participant._id != senderId)
                .map(participant => getReceiverSocketIdChat(participant._id));

            receiversSocketId.forEach(Id => {
                if (Id) { //To Make sure Id is not undefined
                    io.to(Id).emit("newMessage", newMessage);
                }
            });
        }
        return res.status(201).json({
            newMessage
        });
    }
    catch (error) {
        console.log(error);
    }
}
export const getMessage = async (req, res) => {
    // console.log("at backend-->");
    //     console.log(req.id);
    try {
        const conversationId = req.params.id;
        const senderId = req.id;

        // we'll bring (get message) from database only those msg
        // which is in between this particular set of participants by accessing  messageids from message array of conversation
        const conversation = await Conversation.findById(conversationId).populate("messages");
        if(!conversation){
            console.log("no chat found")
            return res.status(400).json();
        }
        // populate is a method which returns messages from msg id  
        //  console.log(conversation);   
        // const msgArray=conversation.messages;  
        // console.log(msgArray);   
        console.log(conversation?.messages);
        return res.status(200).json(conversation?.messages);
    }
    catch (error) {
        console.log(error);
    }
}
export const deleteMessage = async (req, res) => {
    // get msg id

    // then delete from Message (object) and also from conversation
    try {
        const receiverId = req.params.id;
        const senderId = req.id;
        const messageId = req.query.msg_id;

        // const msgArr = await Conversation.findOne({
        //     participants: { $all: [senderId, receiverId] }
        // }).populate("messages").messages;

        // msgArr=msgArr.map((message)=>{
        //     message._id!=messageId;
        // })
        await Conversation.updateOne(
            { participants: [senderId, receiverId] },
            { $pull: { messages: { _id: messageId } } } // pull operator is to remove 
        );

        await Message.deleteOne({ _id: messageId });
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");

        console.log("deleted");
        console.log(conversation?.messages);
        return res.status(200).json(conversation?.messages);

    } catch (error) {
        console.log(error);
    }
}