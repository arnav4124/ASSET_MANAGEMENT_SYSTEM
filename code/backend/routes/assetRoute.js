const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = require('../middleware/multer');
const cloudinary = require('../utils/cloudinary');
// Import necessary models
const Asset = require('../models/asset');
const UserAsset = require('../models/user_asset');
const AssetProject = require('../models/asset_project');
const authMiddleware = require('../middleware/auth');
const Invoice = require('../models/invoice')
const History = require('../models/history')
const User = require('../models/user')
// maintenance model
const Maintenance = require('../models/maintenace')
const createAssetHistory = async (params) => {
  try {
    // Check for required fields
    if (!params.asset_id) throw new Error('Asset ID is required');
    if (!params.performed_by) throw new Error('Performed by (admin ID) is required');
    if (!params.operation_type) throw new Error('Operation type is required');
    let comment = params.comments || '';

    // For specific operations, generate automatic comments if not provided
    if (params.operation_type === 'Location_Changed' && !params.comments) {
      comment = `Location changed from ${params.old_location || 'unknown'} to ${params.new_location || 'unknown'}`;
    } else if (params.operation_type === 'Assigned' && !params.comments) {
      comment = `Asset assigned to ${params.assignment_type === 'Project' ? 'project' : 'individual user'}`;
    } else if (params.operation_type === 'Unassigned' && !params.comments) {
      comment = params.details?.reason || 'Asset unassigned';
    } else if (params.operation_type === 'Transferred' && !params.comments) {
      comment = `Asset transferred${params.old_location && params.new_location ? ` from ${params.old_location} to ${params.new_location}` : ''}`;
    }
    // Create new history object with all provided fields
    const historyEntry = new History({
      asset_id: params.asset_id,
      performed_by: params.performed_by,
      operation_type: params.operation_type,
      // Optional fields
      assignment_type: params.assignment_type,
      issued_to: params.issued_to,
      // operation_time will default to current time if not provided
      operation_time: params.operation_time || Date.now(),
      comments: comment,
      // Add old_location and new_location fields if provided
      old_location: params.old_location || '',
      new_location: params.new_location || ''
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
      Invoice_id,
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
      insurance_date,
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
    let imgUrl = null;
    if (req.files && req.files.Img) {
      imgBuffer = req.files.Img[0].buffer;
      imgUrl = req.files.Img[0].path;
    }


    let additionalFilesBuffer = null;
    if (req.files && req.files.additionalPdf) {
      additionalFilesBuffer = req.files.additionalPdf[0].buffer;
    }

    // Create invoice if invoice PDF is uploaded
    let invoiceId = null;
    let invObject = null;
    console.log("Invoice ID from request:", Invoice_id);
    if (Invoice_id && Invoice_id.trim() !== '') {
      // Validate if the invoice exists in the database
      const existingInvoice = await Invoice.find({ invoice_id: Invoice_id });
      if (!existingInvoice) {
        return res.status(400).json({
          success: false,
          error: 'Invalid invoice ID provided'
        });
      }
      invoiceId = Invoice_id;
      //console.log("Invoice ID from request:", invoiceId);

    } else {
      invoiceId = `INV-${Date.now()}`;
    }
    console.log("Invoice ID set in backend", invoiceId);
    if (req.files && req.files.invoicePdf) {
      const pdfBuffer = req.files.invoicePdf[0].buffer;
      const pdfUrl = req.files.invoicePdf[0].path;
      const pdfFilename = req.files.invoicePdf[0].originalname;
      console.log("PDF Buffer:", pdfBuffer);

      const newInvoice = new Invoice({
        invoice_id: invoiceId,
        pdf_file: pdfBuffer,
        pdf_url: pdfUrl,
        filename: pdfFilename,
        uploadDate: new Date()
      });
      await newInvoice.save();

      // log url
      console.log("Invoice URL:", pdfUrl);

      invObject = newInvoice._id;
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
        newAsset.Invoice_id = invObject;
      }
      // set Img buffer if available
      if (imgBuffer) {
        newAsset.Img = imgBuffer;
      }

      if(imgUrl) {
        newAsset.Img_url = imgUrl;
      }

      console.log("Img URL:", imgUrl);
      console.log("invoice url:", req.files.invoicePdf[0].path);
      // set invoice URL if available
        

      
      // set additional files buffer if available
      if (additionalFilesBuffer) {
        newAsset.additional_files = additionalFilesBuffer;
      }
      // set additional files URL if available
      if (req.files && req.files.additionalPdf) {
        newAsset.additional_files_url = req.files.additionalPdf[0].path;
      }

      return newAsset.save();
    });

    const createdAssets = await Promise.all(assetPromises);
    console.log('Successfully created assets:', createdAssets.length);
    const user_issuer = await User.findById(Issued_by);
    const Issued_by_name = user_issuer ? `${user_issuer.first_name} ${user_issuer.last_name}` : Issued_by;
    //for all asset make history
    for (const asset of createdAssets) {
      await createAssetHistory({
        asset_id: asset._id,
        performed_by: Issued_by,
        operation_type: 'Added',
        assignment_type: null,
        issued_to: null,
        comments: `Asset added by admin ${Issued_by_name}`
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
    const { adminLocation } = req.query;
    let assets;
    
    // If adminLocation parameter is provided, filter assets by location hierarchy
    if (adminLocation) {
      // Get the location document for the admin's location
      console.log("Admin location:", adminLocation);
      const Location = require('../models/location');
      const adminLocationDoc = await Location.findOne({ location_name: adminLocation });
      
      if (!adminLocationDoc) {
        console.log(`Admin location document not found for ${adminLocation}`);
        // If admin location not found in the DB, return regular unfiltered results
        assets = await Asset.find({})
          .populate('Issued_by', 'first_name last_name email')
          .populate('Issued_to', 'first_name last_name email Project_name')
          .populate('category', 'name');
          
        return res.status(200).json(assets);
      }

      console.log(`Admin location found: ${adminLocationDoc.location_name}, ID: ${adminLocationDoc._id}`);

      // Try different query methods to ensure we capture all child locations
      // Some implementations store ObjectIds as strings, others as actual ObjectIds
      const childLocationsObjectId = await Location.find({ parent_location: adminLocationDoc._id });
      const childLocationsString = await Location.find({ parent_location: adminLocationDoc._id.toString() });
      
      // Combine and deduplicate by ID
      const childLocationsMap = new Map();
      [...childLocationsObjectId, ...childLocationsString].forEach(loc => {
        if (!childLocationsMap.has(loc._id.toString())) {
          childLocationsMap.set(loc._id.toString(), loc);
        }
      });
      const childLocations = Array.from(childLocationsMap.values());
      
      console.log(`Found ${childLocations.length} child locations`);
      
      // Get grandchild locations with the same approach
      let allGrandchildLocationsMap = new Map();
      
      for (const childLocation of childLocations) {
        console.log(`Finding grandchildren for location: ${childLocation.location_name}, ID: ${childLocation._id}`);
        
        // Try both ObjectId and string approaches for grandchildren too
        const grandchildObjectId = await Location.find({ parent_location: childLocation._id });
        const grandchildString = await Location.find({ parent_location: childLocation._id.toString() });
        
        // Merge both results, deduplicate
        [...grandchildObjectId, ...grandchildString].forEach(loc => {
          if (!allGrandchildLocationsMap.has(loc._id.toString())) {
            allGrandchildLocationsMap.set(loc._id.toString(), loc);
          }
        });
      }
      
      const allGrandchildLocations = Array.from(allGrandchildLocationsMap.values());
      console.log(`Found ${allGrandchildLocations.length} grandchild locations`);
      
      // Collect all location names for the query
      const locationNames = [
        adminLocation, 
        ...childLocations.map(loc => loc.location_name),
        ...allGrandchildLocations.map(loc => loc.location_name)
      ];

      console.log(`Filtering assets for locations: ${locationNames.join(', ')}`);
      
      // Find assets where Office is in the list of location names
      assets = await Asset.find({ Office: { $in: locationNames } })
        .populate('Issued_by', 'first_name last_name email')
        .populate('Issued_to', 'first_name last_name email Project_name')
        .populate('category', 'name');
        
      console.log(`Found ${assets.length} assets in the filtered locations`);
    } else {
      // If no adminLocation parameter, return all assets (original behavior)
      assets = await Asset.find({})
        .populate('Issued_by', 'first_name last_name email')
        .populate('Issued_to', 'first_name last_name email Project_name')
        .populate('category', 'name');
    }
    
    res.status(200).json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
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
      .populate('Invoice_id', 'invoice_id pdf_file pdf_url filename uploadDate');
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
      // Get user name for history entry
      const user = await User.findById(assignId);
      const userName = user ? `${user.first_name} ${user.last_name}` : assignId;

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
        issued_to: assignId,
        comments: `Asset assigned to user ${userName}`
      });
      return res.status(200).json(newUserAsset);
    } else {
      // Get project name for history entry
      const project = await Project.findById(assignId);
      const projectName = project ? project.Project_name : assignId;

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
        issued_to: assignId,
        comments: `Asset assigned to project ${projectName}`
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
    const user_id = await UserAsset.findOne({ asset_id: req.params.id });
    console.log("User ID:", user_id);
    if (!user_id) {
      return res.status(404).json({ message: "User not found for this asset" });
    }
    const user = await User.findById(user_id.user_email);
    const user_name = user.first_name + user.last_name;
    console.log("User:", user);
    // const user_name = user.first_name+user.last_name
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        Issued_to: null,
        status: "Available",
        assignment_status: false
      },
      { new: true }
    ).populate('Issued_by', 'first_name last_name').populate('Issued_to', 'first_name last_name');

    console.log("Unassigned asset:", asset);

    await createAssetHistory({
      asset_id: req.params.id,
      performed_by: admin,
      operation_type: 'Unassigned',
      assignment_type: null,
      issued_to: null,
      comments: `Asset unassigned from ${user_name}`
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


router.get('/:invoiceId/download', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findOne({ invoice_id: invoiceId });

    if (!invoice || !invoice.pdf_file) {
      return res.status(404).send('Invoice PDF not found.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.filename || 'invoice.pdf'}"`);
    return res.send(invoice.pdf_file);
  } catch (err) {
    return res.status(500).send('Server error.');
  }
});


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
    const admin = req.body.admin; // Fix: Access admin directly from req.body

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

    // Fix: Use await when finding the admin user
    const adminuser = await User.findById(admin);
    const adminuser_name = adminuser ? `${adminuser.first_name} ${adminuser.last_name}` : admin;

    // Update history
    await createAssetHistory({
      asset_id: assetId,
      performed_by: admin,
      operation_type: 'Removed',
      assignment_type: null,
      issued_to: null,
      comments: `Asset deactivated by admin ${adminuser_name}`
    });

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

    // Check for location change
    const isLocationChanged = req.body.isLocationChanged === 'true';
    const previousLocation = req.body.previousLocation;
    const newLocation = req.body.Office;

    // Check if we need to unassign the asset due to location change
    const unassignDueToLocationChange = req.body.unassignDueToLocationChange === 'true';
    const previousAssignee = req.body.previousAssignee;

    // Prepare update object with ONLY editable fields from request body
    const updateData = {
      // These fields can be edited
      asset_type: req.body.asset_type,
      status: req.body.status,
      Office: req.body.Office,
      Sticker_seq: req.body.Sticker_seq,
      description: req.body.description,
      price: req.body.price
    };

    // If unassigning due to location change, add unassignment data
    if (unassignDueToLocationChange) {
      updateData.Issued_to = null;
      updateData.assignment_status = false;
      updateData.status = "Available";  // Set status to Available when unassigned
    }

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

    // Record history based on what changed

    // If asset was unassigned due to location change, record both events
    if (unassignDueToLocationChange) {
      // Get user name for the history entry
      let previousAssigneeName = previousAssignee;
      try {
        const user = await User.findById(previousAssignee);
        if (user) {
          previousAssigneeName = `${user.first_name} ${user.last_name}`;
        }
      } catch (error) {
        console.error("Error getting user name:", error);
      }

      // First record the unassignment
      await createAssetHistory({
        asset_id: assetId,
        performed_by: admin,
        operation_type: 'Unassigned',
        assignment_type: null,
        issued_to: null,
        comments: `Asset unassigned due to location change from user ${previousAssigneeName}`
      });

      // Then record the location change
      await createAssetHistory({
        asset_id: assetId,
        performed_by: admin,
        operation_type: 'Location_Changed',
        assignment_type: null,
        issued_to: null,
        old_location: previousLocation,
        new_location: newLocation,
        comments: `Asset location changed from ${previousLocation} to ${newLocation}`
      });

      console.log(`Asset unassigned and location changed: ${previousLocation} -> ${newLocation}`);
    }
    // If location changed but asset wasn't assigned (or other reason), just record location change
    else if (isLocationChanged) {
      await createAssetHistory({
        asset_id: assetId,
        performed_by: admin,
        operation_type: 'Location_Changed',
        assignment_type: null,
        issued_to: null,
        old_location: previousLocation,
        new_location: newLocation,
        comments: `Asset location changed from ${previousLocation} to ${newLocation}`
      });
      console.log(`Location change recorded in history: ${previousLocation} -> ${newLocation}`);
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get unique brand names from all assets
router.get('/brands/unique', authMiddleware, async (req, res) => {
  try {
    const uniqueBrands = await Asset.distinct('brand_name');
    res.status(200).json({ success: true, brands: uniqueBrands.filter(brand => brand) });
  } catch (error) {
    console.error('Error fetching unique brands:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unique brands',
      message: error.message
    });
  }
});

// Get unique vendor details from all assets
router.get('/vendors/unique', authMiddleware, async (req, res) => {
  try {
    const vendors = await Asset.aggregate([
      {
        $match: {
          vendor_name: { $exists: true, $ne: null, $ne: "" },
          vendor_email: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$vendor_name",
          vendor_name: { $first: "$vendor_name" },
          vendor_email: { $first: "$vendor_email" },
          vendor_phone: { $first: "$vendor_phone" },
          vendor_city: { $first: "$vendor_city" },
          vendor_address: { $first: "$vendor_address" }
        }
      },
      {
        $project: {
          _id: 0,
          vendor_name: 1,
          vendor_email: 1,
          vendor_phone: 1,
          vendor_city: 1,
          vendor_address: 1
        }
      }
    ]);

    res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.error('Error fetching unique vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unique vendors',
      message: error.message
    });
  }
});

// Get asset history including maintenance history
router.get('/:id/history', authMiddleware, async (req, res) => {
  try {
    const assetId = req.params.id;

    // Get asset details
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    // Get history records without populating issued_to yet
    const historyRecords = await History.find({ asset_id: assetId })
      .populate('performed_by', 'first_name last_name email')
      .sort({ operation_time: -1 });

    // Manually handle the issued_to population based on assignment_type
    const populatedHistoryRecords = await Promise.all(historyRecords.map(async (record) => {
      const recordObj = record.toObject();

      // Only attempt to populate if issued_to exists
      if (record.issued_to) {
        try {
          if (record.assignment_type === 'Project') {
            // If it's a project, fetch from Project model
            const Project = require('../models/project');
            const project = await Project.findById(record.issued_to);
            if (project) {
              recordObj.issued_to = {
                _id: project._id,
                Project_name: project.Project_name
              };
            } else {
              console.log(`Project with ID ${record.issued_to} not found for history record ${record._id}`);
              recordObj.issued_to = { Project_name: 'Unknown Project' };
            }
          } else if (record.assignment_type === 'Individual') {
            // If it's an individual user, fetch from User model
            const user = await User.findById(record.issued_to);
            if (user) {
              recordObj.issued_to = {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
              };
            } else {
              console.log(`User with ID ${record.issued_to} not found for history record ${record._id}`);
              recordObj.issued_to = { first_name: 'Unknown', last_name: 'User' };
            }
          } else {
            console.log(`Unknown assignment_type "${record.assignment_type}" for history record ${record._id}`);
          }
        } catch (err) {
          console.error(`Error populating issued_to for record ${record._id}:`, err);
          // Provide default values to prevent frontend errors
          if (record.assignment_type === 'Project') {
            recordObj.issued_to = { Project_name: 'Unknown Project' };
          } else {
            recordObj.issued_to = { first_name: 'Unknown', last_name: 'User' };
          }
        }
      } else if (record.operation_type === 'Assigned') {
        // For assigned operations without an issued_to, provide default values
        if (record.assignment_type === 'Project') {
          recordObj.issued_to = { Project_name: 'Unknown Project' };
        } else {
          recordObj.issued_to = { first_name: 'Unknown', last_name: 'User' };
        }
      }

      return recordObj;
    }));

    // Get maintenance records
    const maintenanceRecords = await Maintenance.find({ asset_id: assetId })
      .sort({ date_of_sending: -1 });

    // Transform maintenance records to match history format for easy integration
    const formattedMaintenanceRecords = maintenanceRecords.map(record => {
      // For maintenance, create two records if completed (sent and returned)
      const records = [];

      // Record for sending to maintenance
      records.push({
        _id: `maintenance_send_${record._id}`,
        asset_id: record.asset_id,
        operation_type: 'Maintenance_Sent',
        operation_time: record.date_of_sending,
        maintenance_type: record.maintenance_type,
        vendor_name: record.vendor_name,
        vendor_email: record.vendor_email,
        expected_return_date: record.expected_date_of_return,
        maintenance_cost: record.maintenance_cost,
        maintenance_id: record._id,
        description: record.description,
        comments: `Asset sent for ${record.maintenance_type.toLowerCase()} to ${record.vendor_name}`
      });

      // If maintenance is completed, add a record for return
      if (record.status === 'Completed') {
        records.push({
          _id: `maintenance_return_${record._id}`,
          asset_id: record.asset_id,
          operation_type: 'Maintenance_Completed',
          operation_time: record.date_of_return,
          maintenance_type: record.maintenance_type,
          vendor_name: record.vendor_name,
          vendor_email: record.vendor_email,
          maintenance_cost: record.maintenance_cost,
          maintenance_id: record._id,
          description: record.description,
          comments: `Asset returned from ${record.maintenance_type.toLowerCase()} by ${record.vendor_name}`
        });
      }

      return records;
    }).flat();

    // Combine and sort all records by date (newest first)
    const allRecords = [...populatedHistoryRecords, ...formattedMaintenanceRecords]
      .sort((a, b) => new Date(b.operation_time) - new Date(a.operation_time));
    // console.log("allRecords is NIdhish dancin",allRecords)
    // write allRecords to a file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'allRecords.json');
    
    fs.writeFileSync('allRecords.json', JSON.stringify(allRecords, null, 2)); 
    res.status(200).json({
      success: true,
      asset: {
        _id: asset._id,
        name: asset.name,
        Serial_number: asset.Serial_number,
        Sticker_seq: asset.Sticker_seq
      },
      history: allRecords
    });

  } catch (error) {
    console.error('Error fetching asset history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset history',
      message: error.message
    });
  }
});

// Transfer asset between locations
router.post('/:id/transfer', authMiddleware, async (req, res) => {
  try {
    const assetId = req.params.id;
    const {
      admin,
      newLocation,
      oldLocation,
      keepAssignment, // boolean to indicate if we should keep the current assignment
      transferReason
    } = req.body;

    if (!admin || !newLocation || !oldLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: admin ID, new location, and old location are required'
      });
    }

    // Find the asset
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    // Update the asset location
    asset.Office = newLocation;

    // Handle assignment based on the request
    let assignmentChanged = false;
    let previousAssignee = null;

    if (!keepAssignment && asset.Issued_to) {
      // If we need to unassign the asset
      previousAssignee = asset.Issued_to;
      asset.Issued_to = null;
      asset.Issued_to_type = null;
      asset.assignment_status = false;
      asset.status = "Available";
      assignmentChanged = true;

      // Remove user-asset relationship if it exists
      if (asset.Issued_to_type === "User") {
        await UserAsset.findOneAndDelete({ asset_id: assetId, user_email: previousAssignee });
      } else if (asset.Issued_to_type === "Project") {
        await AssetProject.findOneAndDelete({ asset_id: assetId, project_id: previousAssignee });
      }
    }

    // Save the asset changes
    await asset.save();

    // Create history record for the transfer
    await createAssetHistory({
      asset_id: assetId,
      performed_by: admin,
      operation_type: 'Transferred',
      issued_to: keepAssignment ? asset.Issued_to : null,
      assignment_type: keepAssignment && asset.Issued_to_type === "Project" ? "Project" : "Individual",
      old_location: oldLocation,
      new_location: newLocation,
      comments: transferReason || `Asset transferred from ${oldLocation} to ${newLocation}`
    });

    // If assignment was changed, create an additional unassignment record
    if (assignmentChanged && previousAssignee) {
      let previousAssigneeName = "Unknown";

      // Try to get the name of the previous assignee
      try {
        if (asset.Issued_to_type === "User") {
          const user = await User.findById(previousAssignee);
          if (user) {
            previousAssigneeName = `${user.first_name} ${user.last_name}`;
          }
        } else if (asset.Issued_to_type === "Project") {
          const project = await Project.findById(previousAssignee);
          if (project) {
            previousAssigneeName = project.Project_name;
          }
        }
      } catch (error) {
        console.error("Error getting previous assignee details:", error);
      }

      await createAssetHistory({
        asset_id: assetId,
        performed_by: admin,
        operation_type: 'Unassigned',
        issued_to: null,
        assignment_type: null,
        comments: `Asset unassigned from ${previousAssigneeName} due to location transfer`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Asset transferred successfully',
      asset
    });
  } catch (error) {
    console.error('Error transferring asset:', error);
    res.status(500).json({
      success: false,
      error: 'Error transferring asset',
      details: error.message
    });
  }
});

module.exports = router;