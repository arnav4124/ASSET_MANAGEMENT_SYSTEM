const {Schema,model} = require('mongoose');

const programmeSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    programme_type:{
        type:String,
        required:true
    },
    programmes_description:{
        type:String,
        required:true
    },
})

const Programme = model('Programme',programmeSchema);

module.exports = Programme;
