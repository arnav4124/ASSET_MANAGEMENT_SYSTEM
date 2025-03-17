const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import necessary models
const Asset = require('../models/asset');
const UserAsset = require('../models/user_asset');
const AssetProject = require('../models/asset_project');
const authMiddleware = require('../middleware/auth');
const Invoice = require('../models/invoice')

// Example: POST add-asset
router.post('/add-asset', upload.fields([{ name: 'Img', maxCount: 1 }, { name: 'invoicePdf', maxCount: 1 }, { name: 'additionalPdf', maxCount: 1 }]), async (req, res) => {
  try {
    console.log('Received add-asset request');
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    const {
      name,
      brand_name,
      asset_type,
      status,
      Office,
      assignment_status,
      Sticker_seq,
      description,
      Issued_by,
      Issued_to,
      vendor_name,
      vendor_email,
      vendor_phone,
      vendor_city,
      vendor_address,
      brand,
      category,
      price,
      quantity,
      serialNumbers
    } = req.body;

    // Validate required fields
    if (!name || !brand_name || !asset_type || !status || !Office || !Sticker_seq || !description || !Issued_by) {
      console.error('Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          name: !name,
          brand_name: !brand_name,
          asset_type: !asset_type,
          status: !status,
          Office: !Office,
          Sticker_seq: !Sticker_seq,
          description: !description,
          Issued_by: !Issued_by
        }
      });
    }

    const assignmentStatusBoolean = assignment_status === 'true';
    let imgBuffer = null;
    if (req.files && req.files.Img) {
      imgBuffer = req.files.Img[0].buffer;
    }

    let additionalFilesBuffer = null;
    if (req.files && req.files.additionalPdf) {
      additionalFilesBuffer = req.files.additionalPdf[0].buffer;
    }

    // Create invoice if invoice PDF is uploaded
    let invoiceId = null;
    if (req.files && req.files.invoicePdf) {
      const pdfBuffer = req.files.invoicePdf[0].buffer;
      const pdfFilename = req.files.invoicePdf[0].originalname;
      const generatedInvoiceId = `INV-${Date.now()}`;

      const newInvoice = new Invoice({
        invoice_id: generatedInvoiceId,
        pdf_file: pdfBuffer,
        filename: pdfFilename,
        uploadDate: new Date()
      });
      await newInvoice.save();

      invoiceId = newInvoice._id;
    }

    // Parse serial numbers from the request
    let serialNumbersArray;
    try {
      serialNumbersArray = JSON.parse(serialNumbers);
      if (!Array.isArray(serialNumbersArray)) {
        throw new Error('Serial numbers must be an array');
      }
    } catch (error) {
      console.error('Error parsing serial numbers:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid serial numbers format',
        details: error.message
      });
    }

    // Create multiple assets with different serial numbers
    const assetPromises = serialNumbersArray.map(async (serialNumber) => {
      if (!serialNumber) {
        throw new Error('Empty serial number found');
      }

      const assetData = {
        name: req.body.name,
        brand_name: req.body.brand_name,
        brand: req.body.brand,
        asset_type: req.body.asset_type,
        status: req.body.status,
        Office: req.body.Office,
        assignment_status: req.body.assignment_status === "true",
        Sticker_seq: req.body.Sticker_seq,
        description: req.body.description,
        Issued_by: req.body.Issued_by === "null" ? null : req.body.Issued_by,
        Issued_to: req.body.Issued_to && req.body.Issued_to.length === 24 ? req.body.Issued_to : null,
        vendor_name: req.body.vendor_name,
        vendor_email: req.body.vendor_email,
        vendor_phone: req.body.vendor_phone,
        vendor_city: req.body.vendor_city,
        vendor_address: req.body.vendor_address,
        category: req.body.category,
        price: req.body.price,
        Serial_number: serialNumber
      };

      const newAsset = new Asset(assetData);

      return newAsset.save();
    });

    const createdAssets = await Promise.all(assetPromises);
    console.log('Successfully created assets:', createdAssets.length);
    return res.status(201).json({ success: true, assets: createdAssets });
  } catch (error) {
    console.error('Error saving assets:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Example: GET all assets
// GET all assets with populated Issued_by and Issued_to fields
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assets = await Asset.find({})
      .populate('Issued_by', 'first_name last_name email')
      .populate('Issued_to', 'first_name last_name email');
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: GET specific asset by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('Issued_by', 'first_name last_name email')
      .populate('Issued_to', 'first_name last_name email');
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/assign_asset/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;       // from URL
    const { assignType, assignId } = req.body; // from request body

    if (assignType === "user") {
      // Entry in user_asset
      const newUserAsset = await UserAsset.create({
        asset_id: assetId,
        user_email: assignId
      });
      // set assignment_status to true
      const asset = await Asset.findById(assetId);
      asset.assignment_status = true;
      await asset.save();
      return res.status(200).json(newUserAsset);
    } else {
      // Entry in asset_project
      const newAssetProject = await AssetProject.create({
        asset_id: assetId,
        project_id: assignId
      });
      const asset = await Asset.findById(assetId);
      asset.assignment_status = true;
      await asset.save();
      return res.status(200).json(newAssetProject);
    }
  } catch (error) {
    console.error("Asset assign error:", error);
    return res.status(500).json({ message: "Error assigning asset" });
  }
});

router.put('/:id/unassign', authMiddleware, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { Issued_to: null }, // or Issued_by as well if needed
      { new: true }
    ).populate('Issued_by', 'first_name last_name').populate('Issued_to', 'first_name last_name');
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Error unassigning asset' });
  }
});

module.exports = router;