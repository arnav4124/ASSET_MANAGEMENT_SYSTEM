const express = require('express')
const admin_router = express.Router()
const User = require('../models/user')
const Location = require('../models/location')
const authMiddleware = require('../middleware/auth')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

admin_router.get('/get_manager', authMiddleware, async (req, res) => {
    console.log("MANAGER CHECK")
    try {
        const manager = await User.find({ role: "User" })
        console.log(manager)
        email_list = []
        res.status(200).json(manager)
        // res.status(200).json(email_list)
    } catch (err) {
        console.error("Error fetching manager:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching manager",
            error: error.message
        });
    }
})

admin_router.post('/add_user', authMiddleware, async (req, res) => {
    console.log("ADD USER")
    const { first_name, last_name, email, location } = req.body
    console.log(req.body)
    password = crypto.randomBytes(6).toString('hex');
    role = "User"
    try {
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
            location,
            role
        })
        await newUser.save()
        res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({
            success: false,
            message: "Error saving user",
            error: err.message
        });
    }
})

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

        // Get all locations to build hierarchy
        const allLocations = await Location.find({});

        // Function to get child locations
        const getChildLocations = (parentLocation) => {
            const children = allLocations.filter(loc => loc.parent_location === parentLocation);
            let childLocations = [...children.map(c => c.location_name)];
            children.forEach(child => {
                childLocations = [...childLocations, ...getChildLocations(child.location_name)];
            });
            return childLocations;
        };

        // Get all valid locations (admin's location and its children)
        const validLocations = [adminLocation, ...getChildLocations(adminLocation)];

        // Get users with role 'User' and matching locations
        const users = await User.find({
            role: 'User',
            location: { $in: validLocations }
        }).select('first_name last_name email location');

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

module.exports = admin_router

