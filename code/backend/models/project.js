const {Schema,model} = require('mongoose'); 

const projectSchema = new Schema({
    Project_name: {
        type: String,
        required: true
    },
    programme_name: {
        type: String,
        required: true
    },
    project_head: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
        
    },
    location: {
        type: String,
        required: true
    },
    deadline: {
        type: Date
    },
    description: {
        type: String,
        required: true
    },
})

const Project = model('Project',projectSchema);
module.exports = Project;