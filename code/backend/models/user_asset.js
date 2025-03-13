const {Schema,model} = require('mongoose');

const userAssetSchema = new Schema({
   asset_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Asset',
    required:true
   },
    user_email:{
        type:String,
        required:true
    },
    project_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    }
})

const UserAsset = model('UserAsset',userAssetSchema);

module.exports = UserAsset;
