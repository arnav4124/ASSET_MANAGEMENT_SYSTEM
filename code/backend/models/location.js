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
    location_detail:{
        type:String,
        required:true
    }   
})

const Itemmodel = model('location',locationSchema); 
module.exports = Itemmodel;