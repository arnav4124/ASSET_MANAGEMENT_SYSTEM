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
router.post('/add_category', authMiddleware, async (req, res) => {
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
        console.log(locations)

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

        console.log(locationStats)

        // Calculate user counts and find admins for each location
        users.forEach(user => {
            if (locationStats[user.location.toLowerCase()]) {
                console.log("Current location", user.location)
                locationStats[user.location.toLowerCase()].userCount++;
                if (user.role === 'Admin') {
                    locationStats[user.location.toLowerCase()].admin = {
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email
                    };
                }
            }
        });
        // console.log("Location stats", locationStats)

        console.log(locationStats)

        // Build the hierarchy
        const buildHierarchy = (parentLocation) => {

            return locations
                .filter(loc => loc.parent_location === parentLocation)
                .map(loc => ({
                    ...loc,
                    stats: locationStats[loc.location_name.toLowerCase()],
                    children: buildHierarchy(loc._id.toString())
                }));
        };

        // Get root level locations and build tree
        const hierarchicalLocations = buildHierarchy("ROOT");
        console.log("Hierarchical locations", hierarchicalLocations)

        console.log(hierarchicalLocations);

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

router.get('/get_all_admins', authMiddleware, async (req, res) => {
    try {
        const admins = await User.find({ role: "Admin" })
        res.status(200).json({
            success: true,
            admins: admins
        })
    }
    catch (err) {
        console.error("Error fetching admins:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching admins",
            error: err.message
        });
    }
})

// Get location vs users count data for graph
router.get('/location_users_graph', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find({}).lean();
        const users = await User.find({}).lean();

        const locationUserCounts = locations.map(location => {
            const userCount = users.filter(user =>
                user.location.toLowerCase() === location.location_name.toLowerCase()
            ).length;

            return {
                location_name: location.location_name,
                user_count: userCount
            };
        });

        res.status(200).json({
            success: true,
            data: locationUserCounts
        });
    } catch (error) {
        console.error('Error fetching location users graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching location users graph data",
            error: error.message
        });
    }
});

// Get category vs assets count data for graph
router.get('/category_assets_graph', authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find({}).lean();
        const assets = await Asset.find({}).lean();

        const categoryAssetCounts = categories.map(category => {
            const assetCount = assets.filter(asset =>
                asset.category && asset.category.toString() === category._id.toString()
            ).length;

            return {
                category_name: category.name,
                asset_count: assetCount
            };
        });

        res.status(200).json({
            success: true,
            data: categoryAssetCounts
        });
    } catch (error) {
        console.error('Error fetching category assets graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching category assets graph data",
            error: error.message
        });
    }
});

// Get programme vs projects count data for graph
router.get('/programme_projects_graph', authMiddleware, async (req, res) => {
    try {
        const programmes = await Programme.find({}).lean();
        const projects = await Project.find({}).lean();

        const programmeProjectCounts = programmes.map(programme => {
            const projectCount = projects.filter(project =>
                project.programme_name === programme.name
            ).length;

            return {
                programme_name: programme.name,
                project_count: projectCount
            };
        });

        res.status(200).json({
            success: true,
            data: programmeProjectCounts
        });
    } catch (error) {
        console.error('Error fetching programme projects graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching programme projects graph data",
            error: error.message
        });
    }
});

// Get location vs assets count data for graph
router.get('/location_assets_graph', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find({}).lean();
        const assets = await Asset.find({}).lean();

        const locationAssetCounts = locations.map(location => {
            const assetCount = assets.filter(asset =>
                asset.Office.toLowerCase() === location.location_name.toLowerCase()
            ).length;

            return {
                location_name: location.location_name,
                asset_count: assetCount
            };
        });

        res.status(200).json({
            success: true,
            data: locationAssetCounts
        });
    } catch (error) {
        console.error('Error fetching location assets graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching location assets graph data",
            error: error.message
        });
    }
});

module.exports = router;
