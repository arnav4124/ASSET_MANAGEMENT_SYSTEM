const express = require('express')
const admin_router = express.Router()
const User = require('../models/user')
const Location = require('../models/location')
const authMiddleware = require('../middleware/auth')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Project = require('../models/project')
const Asset = require('../models/asset')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
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
    const role = "User"
    
    try {
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
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
                <p>Your temporary password is: <strong>${password}</strong></p>
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

// Update a user
admin_router.put('/edit_user/:userId', authMiddleware, async (req, res) => {
    try {
        const { location } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update only location
        user.location = location;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: "Error updating user",
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

module.exports = admin_router

