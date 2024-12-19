import mongoose from "mongoose";

const connectdb=async()=>{
    mongoose
    .connect(process.env.MONGO)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));   
}

export default connectdb;