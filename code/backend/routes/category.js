const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const auth = require('../middleware/auth');
const Category = require('../models/category');

router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
})

router.get('/sticker-sequence/:categoryId', auth, async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: "Category not found" 
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            sticker_short_seq: category.sticker_short_seq 
        });
    } catch (error) {
        console.error("Error fetching category sticker sequence:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching category sticker sequence",
            error: error.message
        });
    }
});

module.exports = router;


