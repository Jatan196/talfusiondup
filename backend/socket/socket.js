import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();

// creating a new socke t server and passing the original one in it , so socket will work like top of layer

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:['http://localhost:3000'],
        methods:['GET','POST'],
    },
});

const userSocketMap={};// {userId->llsocketId} , mainting a map

export const getReceiverSocketIdChat = (receiverId) => {
    return userSocketMap[receiverId];
} 
export const getReceiverSocketIdGroup = (receiverId) => {
    return userSocketMap[receiverId];
} 

       

io.on('connection',(socket)=>{ // switching it on
    console.log('user connected',socket.id); // whenever a user comes online , will that users id in socket (variable name of arrow fucntion)
    // recieiving query from fronted socket
    const userId=socket.handshake.query.userId;
    if(userId!== undefined){
        userSocketMap[userId]=socket.id;
    }

    io.emit('getOnlineUsers',Object.keys(userSocketMap)); // emit sends data from BE to FE

    socket.on('disconnect',()=>{
        console.log('user disconnect',socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers',Object.keys(userSocketMap)); // why this line
    })
})

export {app, io , server};