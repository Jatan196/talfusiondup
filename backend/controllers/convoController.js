import { Conversation } from "../models/conversationModel.js";
// import { Message } from "../models/messageModel.js";
// import { User } from "../models/userModel.js";


export const createConvo = async (req, res) => {
    try {
        console.log(res.data);
        const { participants, chatName, adminId } = req.body;
        console.log("reached BE");
        let extra = "";
        let newConvo = null;
        if (!participants || participants.length < 2) {
            return res.status(400).send("A conversation requires at least two participants.");
        }

        if (chatName && chatName.trim()) { // means a grp conversation
            newConvo = await Conversation.create({
                chatName: chatName,
                participants: participants,
                admin: adminId
            })
            extra = "group";
        }
        else { // one to one
            newConvo = await Conversation.create({
                participants: participants,
                admin: adminId
            })
            extra = "1 to 1";
        }

        //  await newConvo.save(); // after creation it already saves 

        console.log(newConvo);

        return res.status(200).json({
            newConvo,
            message: "Conversation created" + extra
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};
export const getGroups = async (req, res) => {

    try {

        const user = req.id;

        const allConversations = await Conversation.find({
            participants: user // userId should be in ObjectId format
        }).select('chatName admin participants');


        const groups = allConversations.filter(convo => convo.participants.length > 2);

        if (!groups) {
            return res.status(200).json("No groups created yet !");
        }
        console.log("HII");
        return res.status(200).json({
            groups,
            message: "working"
        });
    } catch (error) {
        return res.status(400).json("error aa gyi");
    }

};
/*
export const deleteChat = async (req, res) => {
    const {id} = req.body;
        console.log(id);

    try {
        const deleted = await Conversation.deleteOne({ _id: { $eq: id } });
        if (!deleted) {
            return res.status(200).json({

                message: "Not deleted"
            });
        }
        return res.status(200).json({

            message: "Deleted"
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json("error aa gyi");
    }


};*/

export const clearChat = async (req, res) => {
    try {
        const {id} = req.body;
        console.log(id);
        const convo=await Conversation.findOne({_id:id});
        console.log(convo);
        const cleared =await Conversation.updateOne(
            { _id: { $eq: id } },
            { $set: { messages: [] } }  
        );
        if (!cleared) {
            return res.status(200).json({

                message: "Not cleared"
            });
        }
        return res.status(200).json({

            message: "Cleared"
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json("error aa gyi");
    }
};















