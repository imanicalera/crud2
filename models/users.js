const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
});

module.exports = mongoose.model("User", userSchema);