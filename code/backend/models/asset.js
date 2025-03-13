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
    status:{
        type:String,
        required:true
    },
    Office:{
        type:String,
        required:true
    },
    assignment_status:{
        type:Boolean,
        required:true
    },
    Sticker_seq:{
        type:String,
        required:true
    },
    Img:{
        type:Buffer,
    },
    description:{
        type:String,
        required:true
    },
    Invoice_id:{
        type:String,
        required:true
    },

    Issued_by:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    Issued_to:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
})

const Asset = model('Programme',assetSchema);

module.exports = Asset;
