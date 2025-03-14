const {Schema,model} = require('mongoose');

const userProjectSchema = new Schema({
    user_email:{
        type: Schema.Types.ObjectId,
        required:true
    },
    project_id:{
        type: Schema.Types.ObjectId,
        ref:'Project',
        required:true
    }
})
