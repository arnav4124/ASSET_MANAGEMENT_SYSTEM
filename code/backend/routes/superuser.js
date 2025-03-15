const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Asset = require('../models/asset');
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

module.exports = router;
