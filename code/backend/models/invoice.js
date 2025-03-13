const { Schema, model } = require('mongoose');

const invoiceSchema = new Schema({
    invoice_id: {
        type: String,
        required: true
    },
    pdf_file: {
        type: Buffer,
        required: true
    },
    filename: {
        type: String
    },
   uploadDate:{
    type:Date,
    required:true
   }
})

const Invoice = model('Invoice',invoiceSchema);

module.exports = Invoice;