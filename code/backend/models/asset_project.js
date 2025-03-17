const {Schema,model} = require('mongoose');

const assetProjectSchema = new Schema({
    asset_id:{
        type: Schema.Types.ObjectId,
        ref:'Asset',
        required:true
    },
    project_id:{
        type: Schema.Types.ObjectId,
        ref:'Project',
        required:true
    }
})

module.exports = model('AssetProject', assetProjectSchema);

