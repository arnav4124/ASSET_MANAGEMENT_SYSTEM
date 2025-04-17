const express = require('express')
const admin_router = express.Router()
const User = require('../models/user')
const Location = require('../models/location')
const authMiddleware = require('../middleware/auth')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Project = require('../models/project')
const Asset = require('../models/asset')
const UserAsset = require('../models/user_asset')
const Maintenance = require('../models/maintenace')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const History = require('../models/history')
require("dotenv").config({ path: ".env" });

admin_router.get('/get_manager', authMiddleware, async (req, res) => {
    console.log("MANAGER CHECK")
    try {
        const manager = await User.find({ role: "User" })
        console.log(manager)
        email_list = []
        res.status(200).json(manager)
    } catch (err) {
        console.error("Error fetching manager:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching manager",
            error: err.message
        });
    }
})

const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

admin_router.post('/add_user', authMiddleware, async (req, res) => {
    console.log("ADD USER")
    const { first_name, last_name, email, location, phoneNumber } = req.body
    console.log(req.body)
    const password = crypto.randomBytes(6).toString('hex');
    const send_password = password
    const role = "User"

    try {
        // Hash the password and STORE the hash result
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword, // Store the hashed password
            location,
            role,
            phoneNumber
        })

        await newUser.save()

        try {
            // Send email with the password
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your Account Has Been Created',
                html: `
                <h1>Welcome to Our Application</h1>
                <p>Hello ${first_name} ${last_name},</p>
                <p>Your account has been created successfully.</p>
                <p>Your temporary password is: <strong>${send_password}</strong></p>
                <p>Please log in and change your password as soon as possible.</p>
                <p>Best regards,<br/>The Admin Team</p>
              `
            };

            await transporter.sendMail(mailOptions);

            // If email sending succeeds, send success response
            res.status(201).json({
                success: true,
                message: "User created successfully and email sent"
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // If only the email part fails, still indicate user was created
            res.status(201).json({
                success: true,
                message: "User created successfully but email could not be sent",
                emailError: emailError.message
            });
        }
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
});


// Get users based on admin's location (including child locations)
admin_router.get('/users', authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user.location) {
            return res.status(401).json({
                success: false,
                message: "User location not found in token"
            });
        }

        const adminLocation = req.user.location;
        console.log("Admin location:", adminLocation);
        // search for the admin location in the location table
        const adminLocationData = await Location.findOne({
            location_name: { $regex: adminLocation, $options: 'i' }
        });
        console.log("Admin location data:", adminLocationData);
        // Get all locations to build hierarchy
        const allLocations = await Location.find({});

        // Function to get child locations
        const getChildLocations = (parentLocation, parentLocationId) => {
            const children = allLocations.filter(loc => loc.parent_location === parentLocationId.toString());
            let childLocations = [...children.map(c => c.location_name)];
            children.forEach(child => {
                childLocations = [...childLocations, ...getChildLocations(child.location_name, child._id)];
            });
            return childLocations;
        };

        // Get all valid locations (admin's location and its children)
        const validLocations = [adminLocation, ...getChildLocations(adminLocation, adminLocationData._id)];
        console.log(validLocations)
        // Get users with role 'User'  and 'Admin' and matching locations
        var users = await User.find({
            role: { $in: ["User", "Admin"] },
            location: { $in: validLocations }
        }).select('first_name last_name email location ');
        // remove the Admin of the admin location

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
});

// Add new route to get admin location details
admin_router.get('/location-details/:locationName', authMiddleware, async (req, res) => {
    try {
        const locationName = decodeURIComponent(req.params.locationName);
        console.log("Searching for location:", locationName);

        const locationDetails = await Location.findOne({
            location_name: { $regex: new RegExp('^' + locationName + '$', 'i') }
        });

        console.log("Found location details:", locationDetails);

        if (!locationDetails) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            });
        }

        res.status(200).json({
            success: true,
            location: locationDetails
        });
    } catch (error) {
        console.error('Error fetching location details:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching location details",
            error: error.message
        });
    }
});


// route to get all admins

admin_router.get('/get_admins', authMiddleware, async (req, res) => {
    try {
        const allAdmins = await User.find({ role: "Admin" });
        res.status(200).json(allAdmins);
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({
            message: "Error fetching admins",
            error: error.message
        });
    }

});

// Get a single user by ID
admin_router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
});

// Update a user - Updated to handle asset retention during location changes
admin_router.put('/edit_user/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const { location, assetSelections } = req.body;
        console.log("Updating user:", userId, "with location:", location, "and asset selections:", assetSelections);
        // Get the current user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const oldLocation = user.location;
        const newLocation = location;

        // Update the user's location
        user.location = newLocation;
        await user.save();

        // If the location changed and we have asset selections to process
        if (oldLocation !== newLocation && assetSelections && Object.keys(assetSelections).length > 0) {
            // Get all assets assigned to the user
            const userAssets = await UserAsset.find({ user_email: userId });

            for (const userAsset of userAssets) {
                const assetId = userAsset.asset_id;
                const asset = await Asset.findById(assetId);

                if (!asset) continue;

                // Check if this asset is selected to keep with the user
                if (assetSelections[assetId]) {
                    // Update the asset's location to match the user's new location
                    asset.Office = newLocation;
                    await asset.save();
                } else {
                    // Unassign the asset but keep it at its original location
                    asset.Issued_to = null;
                    asset.Issued_to_type = null;
                    asset.assignment_status = false;
                    asset.status = "Available";
                    await asset.save();

                    // Remove the user-asset relationship
                    await UserAsset.findByIdAndDelete(userAsset._id);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'User and assets updated successfully',
            user
        });
    } catch (error) {
        console.error('Error in edit_user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// Get location vs users count
admin_router.get('/graph/location-users', authMiddleware, async (req, res) => {
    try {
        const adminLocation = req.user.location;
        const adminLocationData = await Location.findOne({
            location_name: { $regex: adminLocation, $options: 'i' }
        });

        if (!adminLocationData) {
            return res.status(404).json({ message: "Admin location not found" });
        }

        // Get all locations to build hierarchy
        const allLocations = await Location.find({});

        // Function to get child locations
        const getChildLocations = (parentLocation, parentLocationId) => {
            const children = allLocations.filter(loc => loc.parent_location === parentLocationId.toString());
            let childLocations = [...children.map(c => c.location_name)];
            children.forEach(child => {
                childLocations = [...childLocations, ...getChildLocations(child.location_name, child._id)];
            });
            return childLocations;
        };

        // Get all valid locations (admin's location and its children)
        const validLocations = [adminLocation, ...getChildLocations(adminLocation, adminLocationData._id)];

        const locationStats = await Promise.all(validLocations.map(async (locName) => {
            const userCount = await User.countDocuments({
                location: locName,
                role: { $in: ["User", "Admin"] }
            });
            return {
                location: locName,
                count: userCount
            };
        }));

        res.status(200).json(locationStats);
    } catch (error) {
        console.error("Error fetching location-user stats:", error);
        res.status(500).json({ message: "Error fetching location-user statistics" });
    }
});

// Get project vs assets count
admin_router.get('/graph/project-assets', authMiddleware, async (req, res) => {
    try {
        const adminLocation = req.user.location;
        const adminLocationData = await Location.findOne({
            location_name: { $regex: adminLocation, $options: 'i' }
        });

        if (!adminLocationData) {
            return res.status(404).json({ message: "Admin location not found" });
        }

        // Get all locations to build hierarchy
        const allLocations = await Location.find({});

        // Function to get child locations
        const getChildLocations = (parentLocation, parentLocationId) => {
            const children = allLocations.filter(loc => loc.parent_location === parentLocationId.toString());
            let childLocations = [...children.map(c => c.location_name)];
            children.forEach(child => {
                childLocations = [...childLocations, ...getChildLocations(child.location_name, child._id)];
            });
            return childLocations;
        };

        // Get all valid locations (admin's location and its children)
        const validLocations = [adminLocation, ...getChildLocations(adminLocation, adminLocationData._id)];

        // Get projects that have any of the locations
        const projects = await Project.find({
            location: { $in: validLocations }
        });

        const projectStats = await Promise.all(projects.map(async (project) => {
            const assetCount = await Asset.countDocuments({
                project: project._id
            });
            return {
                project: project.Project_name,
                count: assetCount
            };
        }));

        res.status(200).json(projectStats);
    } catch (error) {
        console.error("Error fetching project-asset stats:", error);
        res.status(500).json({ message: "Error fetching project-asset statistics" });
    }
});

// Get location vs assets count
admin_router.get('/graph/location-assets', authMiddleware, async (req, res) => {
    try {
        const adminLocation = req.user.location;
        const adminLocationData = await Location.findOne({
            location_name: { $regex: adminLocation, $options: 'i' }
        });

        if (!adminLocationData) {
            return res.status(404).json({ message: "Admin location not found" });
        }

        // Get all locations to build hierarchy
        const allLocations = await Location.find({});

        // Function to get child locations
        const getChildLocations = (parentLocation, parentLocationId) => {
            const children = allLocations.filter(loc => loc.parent_location === parentLocationId.toString());
            let childLocations = [...children.map(c => c.location_name)];
            children.forEach(child => {
                childLocations = [...childLocations, ...getChildLocations(child.location_name, child._id)];
            });
            return childLocations;
        };

        // Get all valid locations (admin's location and its children)
        const validLocations = [adminLocation, ...getChildLocations(adminLocation, adminLocationData._id)];

        const locationStats = await Promise.all(validLocations.map(async (locName) => {
            const assetCount = await Asset.countDocuments({
                Office: locName
            });
            return {
                location: locName,
                count: assetCount
            };
        }));

        res.status(200).json(locationStats);
    } catch (error) {
        console.error("Error fetching location-asset stats:", error);
        res.status(500).json({ message: "Error fetching location-asset statistics" });
    }
});

// Import createAssetHistory utility function
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

// Create a new maintenance record for an asset
admin_router.post('/assets/maintenance', authMiddleware, async (req, res) => {
    try {
        const {
            asset_id,
            date_of_sending,
            expected_date_of_return,
            date_of_return,
            description,
            maintenance_type,
            maintenance_cost,
            vendor_name,
            vendor_contact,
            vendor_address,
            vendor_email
        } = req.body;

        // Get admin ID from token or from request body
        const adminId = req.user?._id || req.body.admin_id;

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: "Admin ID is required to create maintenance record"
            });
        }

        console.log("Creating maintenance record:", req.body);
        // Validate asset exists
        const asset = await Asset.findById(asset_id);
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Create new maintenance record
        const newMaintenance = new Maintenance({
            asset_id,
            date_of_sending: new Date(date_of_sending),
            expected_date_of_return: new Date(expected_date_of_return),
            date_of_return: new Date(date_of_return),
            description,
            maintenance_type,
            maintenance_cost,
            vendor_name,
            vendor_contact,
            vendor_address,
            vendor_email,
            status: 'Pending'
        });

        await newMaintenance.save();

        // Update asset status to Maintenance - using findByIdAndUpdate to avoid validation
        await Asset.findByIdAndUpdate(
            asset_id,
            { status: "Maintenance" },
            { runValidators: false }
        );

        // Create history record for the maintenance action
        // await createAssetHistory({
        //     asset_id: asset_id,
        //     performed_by: adminId,
        //     operation_type: 'Added',
        //     assignment_type: null,
        //     issued_to: null
        // });

        res.status(201).json({
            success: true,
            message: "Asset sent for maintenance successfully",
            maintenance: newMaintenance
        });
    } catch (error) {
        console.error("Error creating maintenance record:", error);
        res.status(500).json({
            success: false,
            message: "Error creating maintenance record",
            error: error.message
        });
    }
});

// Get all maintenance records (with filters)
admin_router.get('/assets/maintenance', authMiddleware, async (req, res) => {
    try {
        const { status, asset_id } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (asset_id) filter.asset_id = asset_id;

        const maintenanceRecords = await Maintenance.find(filter)
            .populate({
                path: 'asset_id',
                select: 'name Serial_number Office'
            });

        res.status(200).json({
            success: true,
            count: maintenanceRecords.length,
            data: maintenanceRecords
        });
    } catch (error) {
        console.error("Error fetching maintenance records:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching maintenance records",
            error: error.message
        });
    }
});

// Get a specific maintenance record
admin_router.get('/assets/maintenance/:id', authMiddleware, async (req, res) => {
    try {
        const maintenanceRecord = await Maintenance.findById(req.params.id)
            .populate({
                path: 'asset_id',
                select: 'name Serial_number description Sticker_seq Office'
            });

        if (!maintenanceRecord) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: maintenanceRecord
        });
    } catch (error) {
        console.error("Error fetching maintenance record:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching maintenance record",
            error: error.message
        });
    }
});

// Update a maintenance record (e.g., mark as completed)
admin_router.put('/assets/maintenance/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            date_of_return,
            maintenance_cost,
            description,
            admin_id: requestAdminId
        } = req.body;

        // Get admin ID from token or request body
        const adminId = req.user?._id || requestAdminId;

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: "Admin ID is required to update maintenance record"
            });
        }

        const maintenanceRecord = await Maintenance.findById(id);
        if (!maintenanceRecord) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        // Update maintenance record
        if (status) maintenanceRecord.status = status;
        if (date_of_return) maintenanceRecord.date_of_return = new Date(date_of_return);
        if (maintenance_cost) maintenanceRecord.maintenance_cost = maintenance_cost;
        if (description) maintenanceRecord.description = description;

        await maintenanceRecord.save();

        // If maintenance is completed, update the asset status back to Available
        if (status === 'Completed') {
            // Using findByIdAndUpdate to bypass validation
            await Asset.findByIdAndUpdate(
                maintenanceRecord.asset_id,
                { status: "Available" },
                { runValidators: false }
            );

            // Create history record for maintenance completion
            // await createAssetHistory({
            //     asset_id: maintenanceRecord.asset_id,
            //     performed_by: adminId,
            //     operation_type: 'Added',
            //     assignment_type: null,
            //     issued_to: null
            // });
        }

        res.status(200).json({
            success: true,
            message: "Maintenance record updated successfully",
            data: maintenanceRecord
        });
    } catch (error) {
        console.error("Error updating maintenance record:", error);
        res.status(500).json({
            success: false,
            message: "Error updating maintenance record",
            error: error.message
        });
    }
});

// Delete a maintenance record
admin_router.delete('/assets/maintenance/:id', authMiddleware, async (req, res) => {
    try {
        const { admin_id: requestAdminId } = req.body;

        // Get admin ID from token or request body
        const adminId = req.user?._id || requestAdminId;

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: "Admin ID is required to delete maintenance record"
            });
        }

        const maintenanceRecord = await Maintenance.findById(req.params.id);

        if (!maintenanceRecord) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        // Store asset_id before deleting the record
        const assetId = maintenanceRecord.asset_id;

        await Maintenance.findByIdAndDelete(req.params.id);

        // Check if there are any other active maintenance records for this asset
        const otherMaintenanceRecords = await Maintenance.find({
            asset_id: assetId,
            status: 'Pending'
        });

        // If no other active maintenance records, update asset status back to Available
        if (otherMaintenanceRecords.length === 0) {
            // Using findByIdAndUpdate to bypass validation
            await Asset.findByIdAndUpdate(
                assetId,
                { status: "Available" },
                { runValidators: false }
            );

            // Create history record for cancelling maintenance
            // await createAssetHistory({
            //     asset_id: assetId,
            //     performed_by: adminId,
            //     operation_type: 'Added',
            //     assignment_type: null,
            //     issued_to: null
            // });
        }

        res.status(200).json({
            success: true,
            message: "Maintenance record deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting maintenance record:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting maintenance record",
            error: error.message
        });
    }
});

// Get assets with pending maintenance
admin_router.get('/assets/pending-maintenance', authMiddleware, async (req, res) => {
    try {
        // Find pending maintenance records
        const maintenanceRecords = await Maintenance.find({ status: 'Pending' })
            .populate({
                path: 'asset_id',
                select: 'name Serial_number Office price Sticker_seq status'
            })
            .sort({ expected_date_of_return: 1 });

        // Format the response
        const formattedRecords = maintenanceRecords.map(record => ({
            maintenance_id: record._id,
            asset_id: record.asset_id?._id || null,
            asset_name: record.asset_id?.name || 'Unknown Asset',
            serial_number: record.asset_id?.Serial_number || 'N/A',
            office: record.asset_id?.Office || 'N/A',
            sticker_seq: record.asset_id?.Sticker_seq || 'N/A',
            price: record.asset_id?.price || 0,
            maintenance_type: record.maintenance_type,
            expected_return_date: record.expected_date_of_return,
            days_in_maintenance: Math.ceil((new Date() - new Date(record.date_of_sending)) / (1000 * 60 * 60 * 24))
        }));

        res.status(200).json({
            success: true,
            count: formattedRecords.length,
            data: formattedRecords
        });
    } catch (error) {
        console.error("Error fetching pending maintenance assets:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching pending maintenance assets",
            error: error.message
        });
    }
});

// Get assets with warranty dates approaching in 5 days or already expired
admin_router.get('/assets/approaching-warranty', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        const fiveDaysLater = new Date();
        fiveDaysLater.setDate(today.getDate() + 5);

        // Find assets where warranty date is expired or within the next 5 days
        const assets = await Asset.find({
            warranty_date: {
                $lte: fiveDaysLater
            }
        }).select('name Serial_number Office price Sticker_seq warranty_date status');

        // Format the response
        const formattedAssets = assets.map(asset => ({
            asset_id: asset._id,
            asset_name: asset.name,
            serial_number: asset.Serial_number || 'N/A',
            office: asset.Office || 'N/A',
            sticker_seq: asset.Sticker_seq || 'N/A',
            price: asset.price || 0,
            warranty_date: asset.warranty_date,
            days_remaining: Math.ceil((new Date(asset.warranty_date) - today) / (1000 * 60 * 60 * 24)),
            status: asset.status
        }));

        res.status(200).json({
            success: true,
            count: formattedAssets.length,
            data: formattedAssets
        });
    } catch (error) {
        console.error("Error fetching assets with approaching warranty dates:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching assets with approaching warranty dates",
            error: error.message
        });
    }
});

// Get assets with insurance dates approaching in 5 days or already expired
admin_router.get('/assets/approaching-insurance', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        const fiveDaysLater = new Date();
        fiveDaysLater.setDate(today.getDate() + 5);

        // Find assets where insurance date is expired or within the next 5 days
        const assets = await Asset.find({
            insurance_date: {
                $lte: fiveDaysLater
            }
        }).select('name Serial_number Office price Sticker_seq insurance_date status');

        // Format the response
        const formattedAssets = assets.map(asset => ({
            asset_id: asset._id,
            asset_name: asset.name,
            serial_number: asset.Serial_number || 'N/A',
            office: asset.Office || 'N/A',
            sticker_seq: asset.Sticker_seq || 'N/A',
            price: asset.price || 0,
            insurance_date: asset.insurance_date,
            days_remaining: Math.ceil((new Date(asset.insurance_date) - today) / (1000 * 60 * 60 * 24)),
            status: asset.status
        }));

        res.status(200).json({
            success: true,
            count: formattedAssets.length,
            data: formattedAssets
        });
    } catch (error) {
        console.error("Error fetching assets with approaching insurance dates:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching assets with approaching insurance dates",
            error: error.message
        });
    }
});

module.exports = admin_router

