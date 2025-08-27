import mongoose from "mongoose";

const userSchema = new mongoose.Schema({},{timestamps:true});

const Users = mongoose.model("Users",userSchema);
export default Users