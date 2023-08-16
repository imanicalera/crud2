const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    addid:{
        type:String,
        required:true,
    }, 
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
});

module.exports = mongoose.model("Ad", AdSchema);