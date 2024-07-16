// Business Logics
import {User} from "../models/userModel.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Conversation } from "../models/conversationModel.js";


export const register = async(req,res)=>{
    try{
       
        const { fullName , username , password , confirmPassword, gender}=req.body;
        
        if(!fullName || !username || !password || !confirmPassword || !gender){
            return res.status(400).json({message:"Please fill all entries"}); 
        }
        if(password!==confirmPassword){
            return res.status(400).json({message:"Bad Authentication"});
        }
        // if user attempts to register with duplicate username 
        const user=await User.findOne({username});
        if(user){
            return res.status(400).json({message:"Username already exists"});
        }
        
        // now to protecting passwords from external theft , we uses hashed versoin of this stuff by bcrypt..
        const hashedPass=await bcrypt.hash(password,10); // higher the numeric value , higher is the strength and time coplexity of hasehd value
        
        // profile photo
        const maleProfilePic=`https://avatar.iran.liara.run/public/boy?username=${username}`
        const femaleProfilePic=`https://avatar.iran.liara.run/public/girl?username=${username}`


        await User.create({
            fullName, // as in this object key and value name is same we directly password , without using key value format
            username,
            password:hashedPass,
            profilePhoto : gender==="male" ? maleProfilePic : femaleProfilePic,
            gender

        });
        // now after successful creation
        return res.status(201).json({
            message:"Account created !!",
            success:true
        })
        
    }
    catch(error){
        console.log(error);
    }
}
export const login = async(req,res)=>{
    console.log(req.body);
    try{ // take username and password from req.body
        const {  username , password  }=req.body;

        if(!username || !password ){
            return res.status(400).json({message:"Please fill all entries"});
        }
        console.log("finding user in data base");
        const user=await User.findOne({username});
        console.log("found the user");
        if(!user){
            return res.status(400).json({
                message:"No Account Exist with given Username",
                success:false
            });
        }
        
        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        
        if(!isPasswordCorrect){
            return res.status(400).json({
                message:"Authentication Failed!!",
                success:false
            })
        }

        const tokenData={
            userId:user._id // from where this user with small u?? --> this user is one which we got from findOne method of  schema of "User" that we have imported 
        } 

        const token=await jwt.sign(tokenData,process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
    // in browser , in cookie token's key and data ,and its extra info , will stored like , (cookie name or a variable ) "token" and its data as token 
    // const token = xy ( if above jwt return xy to it)  
    console.log("sending response");
        return res.status(200).cookie("token",token,{maxAge: 1*24*60*60*1000, httpOnly:true,sameSite:'strict'}).json({
          // this security is to protect our cookie from being stolen
           message:"You Are INN!!",
          // now returning json data as response to client side  
          _id:user._id,
          username:user.username,
          fullName:user.fullName,
          profilePhoto:user.profilePhoto
        }) 
    }       
    catch(error){ 
        console.log(error);
    }
}

export const logout= async(req,res)=>{
    try{
        return res.status(200).cookie("token","",{maxAge:0}).json({
            message:"Successfully logged out"
        });
    }
    catch(error){
        console.log(error);
    }
 }
 
export const getOtherUsers= async(req,res)=>{
   try{
     // we'll user except the loggedin one
     const loggedInUserId = req.id; // which is stored in isAuthenticated method
        console.log("hi");
     // Find all users except the logged-in user
     const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

     // Create an array of promises for finding conversations
     const convoPromises = otherUsers.map(async (otherUser) => {
         const convo = await Conversation.findOne({
             participants: {
                 $all: [
                    loggedInUserId,
                    otherUser._id
                 ],
                 $size: 2
             }
         }).select('_id'); // Select only the _id field

         return {
             userId: otherUser._id,
             convoId: convo ? convo._id : null
         };
     });

     // Wait for all promises to resolve
     const convoMappings = await Promise.all(convoPromises);

     // Prepare the response object
     const response = {
         otherUsers: otherUsers,
         convoMappings: convoMappings.reduce((acc, mapping) => { // conversion from array of pairs to single json mapping object
             acc[mapping.userId] = mapping.convoId;
             return acc;
         },{})
     };

     return res.status(200).json(response);
 } catch (error) {
     console.error(error);
     return res.status(500).json({ error: 'Internal Server Error' });
 }
};