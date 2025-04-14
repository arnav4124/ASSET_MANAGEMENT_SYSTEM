const {Schema,model} = require('mongoose');

const historySchema = new Schema({
    asset_id:{
        type:Schema.Types.ObjectId,
        ref:'Asset',
        required:true
    },
     performed_by:{ //the admin who assign / unassign / remove / add the asset
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
     },
     assignment_type:{
        type:String,
        enum:['Project','Individual'],
      //   required:true
     },
     issued_to:{
        type:Schema.Types.ObjectId,
      //   required:true
     },
   operation_type:{
      type:String,
      enum:['Assigned','Unassigned','Added','Removed'],
      required:true
   },
   operation_time:{
      type:Date,
      default:Date.now
   },
})

module.exports = model('History', historySchema);
