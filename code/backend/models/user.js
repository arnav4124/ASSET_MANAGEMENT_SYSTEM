const {Schema,model} = require('mongoose'); 

const userSchema = new Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    // set a auto incremented id

    password:{
        type:String,
        required:true,
        length:6
    },
    location:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    }
})

const User = model('User',userSchema);

module.exports = User;