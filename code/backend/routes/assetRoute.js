const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import necessary models
const Asset = require('../models/asset');

// Example: POST add-asset
router.post('/add-asset', upload.single('Img'), async (req, res) => {
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
      Invoice_id,
      Issued_by,
      Issued_to,
    } = req.body;

    const assignmentStatusBoolean = assignment_status === 'true';
    let imgBuffer = null;
    if (req.file) {
      imgBuffer = req.file.buffer;
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
    });

    newAsset.Issued_by = Issued_by;
    if (Invoice_id) {
      newAsset.Invoice_id = Invoice_id;
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
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find({});
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: GET specific asset by id
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;