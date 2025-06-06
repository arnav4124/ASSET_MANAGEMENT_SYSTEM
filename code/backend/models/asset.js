const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand_name: {
        type: String,
        // required:true
    },
    Serial_number: {
        type: String,
        // required: true,
        // unique: true
    },

    asset_type: {
        type: String,
        required: true,
        enum: ["physical", "virtual"]
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        //required:true 
    },

    status: {
        type: String,
        required: true,
        enum: ["Available", "Unavailable", "Maintenance", "Disposed", "Inactive"]
    },

    Office: {
        type: String,
        required: true
    },

    assignment_status: {
        type: Boolean,
        default: false
    },

    Sticker_seq: {
        type: String,
        required: true,
    },

    Img: {
        type: Buffer,
    },

    Img_url: {
        type: String
    },

    description: {
        type: String,
        required: true
    },
    Invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        // required: true
        default: null
    },

    Issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    Issued_to: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'Issued_to_type'
    },

    Issued_to_type: {
        type: String,
        enum: ['User', 'Project'],
        //required: true
    },

    Issued_date: {
        type: Date,
        default: null
    },

    date_of_purchase: {
        type: Date,
        default: Date.now()
    },

    vendor_name: {
        type: String,
        // required:true
    },
    vendor_email: {
        type: String,
        // required:true
    },
    vendor_phone: {
        type: String,
        // required:true
    },
    vendor_city: {
        type: String,
        // required:true
    },
    vendor_address: {
        type: String,
        // required:true
    },
    vendor_name: {
        type: String,
        // required:true
    },
    additional_files: {
        type: Buffer,
        // required:true
    },

    additional_files_url: {
        type: String,
        // required:true
    },
    brand: {
        type: String,
        // required: true,
    },

    voucher_number: {
        type: String,
        // required:true
    },

    grouping: {
        type: String,
        enum: ['Grouped', 'Individual'],
        required: true,
        default: 'Individual'
    },

    qty: {
        type: Number,
        default: 1
    },

    price: {
        type: Number,
        required: true,
        default: 0
    },
    warranty_date: {
        type: Date,
        default: null
    },
    insurance_date: {
        type: Date,
        default: null
    },
}, {
    timestamps: true,
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;


