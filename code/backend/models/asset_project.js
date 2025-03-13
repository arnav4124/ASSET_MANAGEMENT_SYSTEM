const {Schema,model} = require('mongoose');

const assetProjectSchema = new Schema({
    asset_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Asset',
        required:true
    },
    project_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    }
})
