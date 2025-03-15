const {Schema,model} = require('mongoose');

const assetSchema = new Schema({
    name:{
        type:String,
        required:true
    },

    Serial_number:{
        type:String,
        required:true
    },

    asset_type:{
        type:String,
        required:true
    },

    category:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        //required:true 
    },

    status:{
        type:String,
        required:true,
        default: 'Available'
    },

    Office:{
        type:String,
        required:true
    },

    assignment_status:{
        type:Boolean,
        required:true,
        default:false
    },

    Sticker_seq:{
        type:String,
        required:true,
        default:null
    },

    Img:{
        type:Buffer,
    },

    description:{
        type:String,
        required:true
    },
    Invoice_id:{
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
        default: null
    },

    Issued_by:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    Issued_to:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
})

const Asset = model('Asset',assetSchema);

module.exports = Asset;
