const { Schema, model } = require('mongoose');

const maintenanceSchema = new Schema({
    asset_id: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },
    date_of_sending: {
        type: Date,
        required: true
    },
    expected_date_of_return: {
        type: Date,
        required: true
    },
    date_of_return: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    maintenance_type: {
        type: String,
        enum: ['Repair', 'Replacement'],
        required: true
    },
    maintenance_cost: {
        type: Number,
        required: true
    },
    vendor_name: {
        type: String,
        required: true
    },
    vendor_contact: {
        type: String,
        required: true
    },
    vendor_address: {
        type: String,
        required: true
    },
    vendor_email: {
        type: String,
        required: true
    },

})
const Maintenance = model('Maintenance', maintenanceSchema);
module.exports = Maintenance;

