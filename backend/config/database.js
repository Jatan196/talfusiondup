import mongoose from "mongoose";

const connectDB = async () => {
await mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Database gets connected');
  
}).catch((error)=>{
    console.log(error);
    console.log('hi');
})  
};
export default connectDB;  