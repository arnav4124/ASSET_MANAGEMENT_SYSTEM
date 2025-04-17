const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    sticker_short_seq: {
        type: String,
        required: true
    },
    lifespan: {
        type: Number,
        default: null
    },
    depreciation_rate: {
        type: Number,
        required: true,
        min: 0
    }
});

const Category = model('Category', categorySchema);
module.exports = Category;