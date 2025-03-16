const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Asset = require('../models/asset');
const authMiddleware = require('../middleware/auth');
const Location = require('../models/location');
const User = require('../models/user');
const Programme = require('../models/programme');
const Project = require('../models/project');

// Add a new category
router.post('/add_category',authMiddleware, async (req, res) => {
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
router.get('/categories', authMiddleware, async (req, res) => {
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

// Get all programmes with their projects
router.get('/programmes', authMiddleware, async (req, res) => {
    try {
        // Get all programmes
        const programmes = await Programme.find({}).lean();

        // Get all projects
        const projects = await Project.find({})
            .populate('project_head', 'first_name last_name email')
            .lean();

        // Group projects by programme
        const programmeStats = {};
        programmes.forEach(prog => {
            programmeStats[prog.name] = {
                projectCount: 0,
                projects: []
            };
        });

        // Calculate project counts and group projects
        projects.forEach(project => {
            if (programmeStats[project.programme_name]) {
                programmeStats[project.programme_name].projectCount++;
                programmeStats[project.programme_name].projects.push({
                    ...project,
                    project_head_name: `${project.project_head.first_name} ${project.project_head.last_name}`
                });
            }
        });

        // Add stats to programmes
        const programmesWithProjects = programmes.map(prog => ({
            ...prog,
            stats: programmeStats[prog.name] || { projectCount: 0, projects: [] }
        }));

        res.json({
            success: true,
            programmes: programmesWithProjects
        });

    } catch (error) {
        console.error('Error fetching programmes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching programmes',
            error: error.message
        });
    }
});

router.get('/get_categories', authMiddleware, async (req, res) => {
    console.log("GET CATEGORIES")
    try {
        const categories = await Category.find()
        console.log(categories)
        asset_count = []
        for (let i = 0; i < categories.length; i++) {
            asset_count.push(await Asset.countDocuments({ category: categories[i]._id }))
        }
        console.log(asset_count)
        for (let i = 0; i < categories.length; i++) {
            categories[i] = categories[i].toObject()
            categories[i].asset_count = asset_count[i]
        }
        res.status(200).json({
            success: true,
            categories: categories
        })
    }
    catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: err.message
        });
    }
})

module.exports = router;
