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
const History = require('../models/history')
const createAssetHistory = async (params) => {
  try {
    // Check for required fields
    if (!params.asset_id) throw new Error('Asset ID is required');
    if (!params.performed_by) throw new Error('Performed by (admin ID) is required');
    if (!params.operation_type) throw new Error('Operation type is required');

    // Create new history object with all provided fields
    const historyEntry = new History({
      asset_id: params.asset_id,
      performed_by: params.performed_by,
      operation_type: params.operation_type,
      // Optional fields
      assignment_type: params.assignment_type,
      issued_to: params.issued_to,
      // operation_time will default to current time if not provided
      operation_time: params.operation_time || Date.now()
    });

    // Save the history record
    await historyEntry.save();
    console.log('Asset history recorded successfully');
    return historyEntry;
  } catch (error) {
    console.error('Failed to record asset history:', error);
    throw error;
  }
};

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
      serialNumbers,
      voucher_number,
      grouping,
      warranty_date,
      insurance_date
    } = req.body;

    // Validate required fields
    if (!name || !brand_name || !asset_type || !status || !Office || !Sticker_seq || !description || !Issued_by || !voucher_number || !grouping || !category || !price) {
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
          Issued_by: !Issued_by,
          voucher_number: !voucher_number,
          grouping: !grouping,
          category: !category,
          price: !price,
          warranty_date: !warranty_date,
          insurance_date: !insurance_date
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

    // check if date of purchase is provided
    let date_of_purchase = req.body.date_of_purchase;
    if (date_of_purchase) {
      date_of_purchase = new Date(date_of_purchase);
    } else {
      date_of_purchase = new Date();
    }

    // Process warranty_date and insurance_date
    let parsedWarrantyDate = null;
    if (warranty_date) {
      parsedWarrantyDate = new Date(warranty_date);
    }

    let parsedInsuranceDate = null;
    if (insurance_date) {
      parsedInsuranceDate = new Date(insurance_date);
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
      // Removed validation that throws error for empty serial numbers
      
      const assetData = {
        name: req.body.name,
        brand: req.body.brand_name,
        // brand: req.body.brand,
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
        // Only set the serial number if it's not empty
        ...(serialNumber && { Serial_number: serialNumber }),
        voucher_number: req.body.voucher_number,
        date_of_purchase: date_of_purchase,
        grouping: req.body.grouping,
        quantity: req.body.quantity,
        warranty_date: parsedWarrantyDate,
        insurance_date: parsedInsuranceDate
      };

      const newAsset = new Asset(assetData);
      // Set invoice ID if available
      if (invoiceId) {
        newAsset.Invoice_id = invoiceId;
      }
      // set Img buffer if available
      if (imgBuffer) {
        newAsset.Img = imgBuffer;
      }
      // set additional files buffer if available
      if (additionalFilesBuffer) {
        newAsset.additional_files = additionalFilesBuffer;
      }

      return newAsset.save();
    });

    const createdAssets = await Promise.all(assetPromises);
    console.log('Successfully created assets:', createdAssets.length);
    //for all asset make history
    for (const asset of createdAssets) {
      await createAssetHistory({
        asset_id: asset._id,
        performed_by: Issued_by,
        operation_type: 'Added',
        assignment_type: null,
        issued_to: null
      });
    }
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
      .populate('Issued_to', 'first_name last_name email Project_name')
      .populate('category', 'name');
    res.status(200).json(assets);
    console.log('Assets:', assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: GET specific asset by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('Issued_by', 'first_name last_name email')
      .populate('Issued_to', 'first_name last_name email Project_name')
      .populate('category', 'name')
    console.log("Asset:", asset);
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
    const { assignType, assignId, admin } = req.body; // from request body
    console.log("REQUEST BODY", req);
    if (assignType === "user") {
      // Entry in user_asset
      const newUserAsset = await UserAsset.create({
        asset_id: assetId,
        user_email: assignId
      });
      // set assignment_status to true
      const asset = await Asset.findById(assetId);
      asset.assignment_status = true;
      asset.Issued_to_type = "User";
      asset.status = "Unavailable";
      asset.Issued_to = assignId;
      asset.Issued_date = new Date();
      await asset.save();
      // create history
      await createAssetHistory({
        asset_id: assetId,
        performed_by: admin,
        operation_type: 'Assigned',
        assignment_type: 'Individual',
        issued_to: assignId
      });
      return res.status(200).json(newUserAsset);
    } else {
      // Entry in asset_project
      const newAssetProject = await AssetProject.create({
        asset_id: assetId,
        project_id: assignId
      });
      const asset = await Asset.findById(assetId);
      asset.assignment_status = true;
      asset.Issued_to_type = "Project";
      asset.Issued_to = assignId;
      asset.status = "Unavailable";
      asset.Issued_date = new Date();
      await asset.save();
      // create history
      await createAssetHistory({
        asset_id: assetId,
        performed_by: admin,
        operation_type: 'Assigned',
        assignment_type: 'Project',
        issued_to: assignId
      });
      return res.status(200).json(newAssetProject);
    }
  } catch (error) {
    console.error("Asset assign error:", error);
    return res.status(500).json({ message: "Error assigning asset" });
  }
});

router.put('/:id/unassign', authMiddleware, async (req, res) => {
  try {
    const { admin } = req.body; // Get admin from request body

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        Issued_to: null, // or Issued_by as well if needed
        status: "Available", assignment_status: false
      },
      { new: true }
    ).populate('Issued_by', 'first_name last_name').populate('Issued_to', 'first_name last_name');
    console.log("Unassigned asset:", asset);

    await createAssetHistory({
      asset_id: req.params.id,
      performed_by: admin, // Use admin from request body
      operation_type: 'Unassigned',
      assignment_type: null, // Fixed: changed NULL to null
      issued_to: null // Fixed: changed NULL to null
    });

    res.status(200).json(asset);
  } catch (error) {
    console.error("Unassign error:", error);
    res.status(500).json({ error: 'Error unassigning asset' });
  }
});

router.get('/get_user_assets/:id', authMiddleware, async (req, res) => {
  try {
    console.log(req.params.id)
    const userAssets = await UserAsset.find({ user_email: req.params.id })
    console.log(userAssets.length)
    const assetIds = userAssets.map(userAsset => userAsset.asset_id);
    const asses = []
    for (const assetId of assetIds) {
      // Populate the Issued_by field to get the user's name
      const asset = await Asset.findById(assetId)
        .populate('Issued_by', 'first_name last_name email')
        .populate('Issued_to', 'first_name last_name email Project_name');
      asses.push(asset)
    }
    console.log(asses)
    res.status(200).json(asses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching user assets' })
  }
}
)


router.post('/filter', authMiddleware, async (req, res) => {
  try {
    const { status, issued, office, category } = req.body;
    console.log("Filter request body:", req.body);
    const filter = {};

    if (status != undefined && status !== '') {
      filter.status = status;
    }

    console.log(issued)
    if (issued !== undefined && issued !== '') {
      filter.assignment_status = issued;
    }
    console.log("Office", office);
    if (office !== undefined && office !== '') {
      filter.Office = office;
    }

    console.log("Status", status);


    if (category !== '') {
      console.log("Category", category);
      filter.category = category;
    } else {
      console.log("Category not provided");
    }

    console.log("Filter object:", filter);

    const assets = await Asset.find(filter)
      .populate('Issued_by', 'first_name last_name email')
      .populate('Issued_to', 'first_name last_name email Project_name')
      .populate('category', 'name')

    console.log("Filtered assets:", assets);

    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/deactivate', authMiddleware, async (req, res) => {
  try {
    console.log("Inactivate request body:", req.body);
    const assetId = req.params.id;
    const { admin } = req.body;

    if (!admin) {
      return res.status(400).json({ error: 'Admin ID is required' });
    }

    const asset = await Asset.findByIdAndUpdate(
      assetId,
      { status: "Inactive" },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Update history
    // await createAssetHistory({
    //   asset_id: assetId,
    //   performed_by: admin,
    //   operation_type: 'Removed',
    //   assignment_type: null,
    //   issued_to: null
    // });

    res.status(200).json(asset);
  } catch (error) {
    console.error("Error deactivating asset:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add this route to handle asset updates

// PUT: Update asset by id
router.put('/:id', authMiddleware, upload.fields([
  { name: 'Img', maxCount: 1 },
  { name: 'invoicePdf', maxCount: 1 },
  { name: 'additionalPdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const assetId = req.params.id;
    const { admin } = req.body;

    console.log("Update asset request received for asset ID:", assetId);
    console.log("Request body:", req.body);

    if (!admin) {
      return res.status(400).json({ error: 'Admin ID is required' });
    }

    // Find the asset to update
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Prepare update object with ONLY editable fields from request body
    // Read-only fields (from frontend) are: name, brand_name, Serial_number, voucher_number, date_of_purchase, vendor_*
    const updateData = {
      // These fields can be edited
      asset_type: req.body.asset_type,
      status: req.body.status,
      Office: req.body.Office,
      Sticker_seq: req.body.Sticker_seq,
      description: req.body.description,
      price: req.body.price
    };

    // Only update non-empty fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    // Handle category if provided
    if (req.body.category && req.body.category !== '') {
      updateData.category = req.body.category;
    }

    // Handle warranty_date if provided
    console.log("Warranty date from request:", req.body.warranty_date);
    if (req.body.warranty_date && req.body.warranty_date !== '') {
      try {
        updateData.warranty_date = new Date(req.body.warranty_date);
        console.log("Parsed warranty date:", updateData.warranty_date);
      } catch (error) {
        console.error("Error parsing warranty date:", error);
        // Keep existing value if there's an error
        updateData.warranty_date = asset.warranty_date;
      }
    } else if (req.body.warranty_date === '') {
      // If explicitly set to empty, set to null
      updateData.warranty_date = null;
    }
    // If warranty_date is not in the request, leave the existing value unchanged

    // Handle insurance_date if provided
    console.log("Insurance date from request:", req.body.insurance_date);
    if (req.body.insurance_date && req.body.insurance_date !== '') {
      try {
        updateData.insurance_date = new Date(req.body.insurance_date);
        console.log("Parsed insurance date:", updateData.insurance_date);
      } catch (error) {
        console.error("Error parsing insurance date:", error);
        // Keep existing value if there's an error
        updateData.insurance_date = asset.insurance_date;
      }
    } else if (req.body.insurance_date === '') {
      // If explicitly set to empty, set to null
      updateData.insurance_date = null;
    }
    // If insurance_date is not in the request, leave the existing value unchanged

    // Handle file uploads
    // Update image if provided
    if (req.files && req.files.Img) {
      updateData.Img = req.files.Img[0].buffer;
    }

    // Handle invoice PDF update
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

      updateData.Invoice_id = newInvoice._id;
    }

    // Handle additional PDF update
    if (req.files && req.files.additionalPdf) {
      updateData.additional_files = req.files.additionalPdf[0].buffer;
    }

    console.log('Updating asset with data:', updateData);

    // Update the asset
    const updatedAsset = await Asset.findByIdAndUpdate(
      assetId,
      updateData,
      { new: true, runValidators: true }
    ).populate('Issued_by', 'first_name last_name email')
      .populate('Issued_to', 'first_name last_name email Project_name')
      .populate('category', 'name');

    console.log("Asset updated successfully. Updated warranty date:", updatedAsset.warranty_date);
    console.log("Updated insurance date:", updatedAsset.insurance_date);

    // Create history record for the update
    // await createAssetHistory({
    //   asset_id: assetId,
    //   performed_by: admin,
    //   operation_type: 'Added',
    //   assignment_type: null,
    //   issued_to: null
    // });

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;