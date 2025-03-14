const { Schema, model } = require('mongoose');

const userProjectSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    }
});

module.exports = model('UserProject', userProjectSchema);
