const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const authMiddleware = require('../middleware/auth');
const Location = require('../models/location');
const User = require('../models/user');

// Add a new category
router.post('/add_category', async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        // Create new category
        const category = new Category({
            name: name.trim(),
            description: description.trim()
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            category
        });

    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({
            success: false,
            message: "Error adding category",
            error: error.message
        });
    }
});

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
});

// Get all locations with hierarchy, user counts, and admin details
router.get('/locations', authMiddleware, async (req, res) => {
    try {
        // Get all locations
        const locations = await Location.find({}).lean();

        // Get all users grouped by location
        const users = await User.find({}).lean();

        // Create a map of location stats
        const locationStats = {};
        locations.forEach(loc => {
                locationStats[loc.location_name.toLowerCase()] = {
                userCount: 0,
                admin: null
            };
        });

        // Calculate user counts and find admins for each location
        users.forEach(user => {
            if (locationStats[user.location.toLowerCase()]) {
                locationStats[user.location.toLowerCase()].userCount++;
                if (user.role === 'Admin') {
                    locationStats[user.location.toLowerCase()].admin = {
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email
                    };
                }
            }
        });

        // Build the hierarchy
        const buildHierarchy = (parentLocation) => {
            
            return locations
                .filter(loc => loc.parent_location === parentLocation)
                .map(loc => ({
                    ...loc,
                    stats: locationStats[loc.location_name],
                    children: buildHierarchy(loc._id.toString())
                }));
        };

        // Get root level locations and build tree
        const hierarchicalLocations = buildHierarchy("ROOT");

        res.json({
            success: true,
            locations: hierarchicalLocations
        });

    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
});

module.exports = router;
