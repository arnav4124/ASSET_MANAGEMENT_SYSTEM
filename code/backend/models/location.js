const {Schema,model} = require('mongoose'); 


const locationSchema = new Schema({
    location_name:{
        type:String,
        required:true,
        unique:true
    },
    parent_location:{
        type:String,
        ref:'location',
        default:"ROOT"
    },
    location_type:{
        type:String,
        required:true
    },
    address:{
        //this will store the address complete adress has to be put up here
        type:String,
        required:true
    },   
    pincode:{
        type:Number,
        required:true
    }
})

const Location = model('location',locationSchema); 
module.exports = Location;