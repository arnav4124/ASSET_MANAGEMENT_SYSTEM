const {Schema,model} = require('mongoose');

const userProjectSchema = new Schema({
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
