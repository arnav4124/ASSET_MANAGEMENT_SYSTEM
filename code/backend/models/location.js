const {Schema,model} = require('mongoose'); 


const locationSchema = new Schema({
    location_name:{
        type:String,
        required:true,
        unique:true
    },
    parent_location:{
        type: Schema.Types.Mixed,
        ref:'Location',
        default:"ROOT"
    },
    location_type:{
        type:String,
        required:true
    },
    sticker_short_seq:{
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

const Location = model('Location',locationSchema); 
module.exports = Location;