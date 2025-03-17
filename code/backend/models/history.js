const {Schema,model} = require('mongoose');

const historySchema = new Schema({
    asset_id:{
        type:Schema.Types.ObjectId,
        ref:'Asset',
        required:true
    },
     issued_by:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
     },
     assignment_type:{
        type:String,
        enum:['Project','Individual'],
        required:true
     },
     project_id:{
        type:Schema.Types.ObjectId,
        ref:'Project',
        required:true
     },
     issued_to:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
     },
     unassigned_by:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
     },
     unassigned_at:{
        type:Date,
        default:Date.now
     },
            assigned_at:{
                type:Date,
                default:Date.now
            }
   
})

module.exports = model('History', historySchema);
