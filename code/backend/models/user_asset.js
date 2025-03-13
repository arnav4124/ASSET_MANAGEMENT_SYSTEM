const {Schema,model} = require('mongoose');

const userAssetSchema = new Schema({
   asset_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Asset',
    required:true
   },
    user_email:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    project_id:{
        type: Schema.Types.ObjectId,
        ref:'Project',
        required:true
    }
})

const UserAsset = model('UserAsset',userAssetSchema);

module.exports = UserAsset;
