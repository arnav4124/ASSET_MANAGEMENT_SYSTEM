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
router.post('/add-asset', upload.fields([{ name: 'Img', maxCount: 1}, {name: 'invoicePdf', maxCount: 1}]), async (req, res) => {
  try {
    console.log("here");
    const {
      name,
      Serial_number,
      asset_type,
      status,
      Office,
      assignment_status,
      Sticker_seq,
      description,
      Issued_by,
      Issued_to,
    } = req.body;

    const assignmentStatusBoolean = assignment_status === 'true';
    let imgBuffer = null;
    if (req.files && req.files.Img) {
      imgBuffer = req.files.Img[0].buffer;
    }

    const newAsset = new Asset({
      name,
      Serial_number,
      asset_type,
      status,
      Office,
      assignment_status: assignmentStatusBoolean,
      Sticker_seq,
      Img: imgBuffer,
      description,
      Issued_by
    });

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

      newAsset.Invoice_id = newInvoice._id;
    }

    if (Issued_to && Issued_to.length === 24) {
      newAsset.Issued_to = Issued_to;
    }

    await newAsset.save();
    return res.status(201).json({ success: true, asset: newAsset });
  } catch (error) {
    console.error('Error saving asset:', error);
    return res.status(500).json({ success: false, error: error.message });
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