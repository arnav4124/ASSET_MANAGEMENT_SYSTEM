const express = require('express');
const router = express.Router();
const Programme = require('../models/programme');
const authMiddleware = require('../middleware/auth');
// const programmeRouter=require('../routes/programme');
// Create a new programme
router.post('/',  async (req, res) => {
    try {
        const { name, programme_type, programmes_description } = req.body;

        // Enhanced validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                message: "Programme name is required and must be a non-empty string"
            });
        }

        if (!programme_type || typeof programme_type !== 'string' || programme_type.trim().length === 0) {
            return res.status(400).json({
                message: "Programme type is required and must be a non-empty string"
            });
        }

        if (!programmes_description || typeof programmes_description !== 'string' || programmes_description.trim().length === 0) {
            return res.status(400).json({
                message: "Programme description is required and must be a non-empty string"
            });
        }

        // Validate programme_type is one of the allowed values
        const allowedTypes = ['research', 'development', 'innovation', 'education', 'community'];
        if (!allowedTypes.includes(programme_type.toLowerCase())) {
            return res.status(400).json({
                message: "Invalid programme type. Must be one of: " + allowedTypes.join(', ')
            });
        }

        // Create new programme with trimmed values
        const programme = new Programme({
            name: name.trim(),
            programme_type: programme_type.toLowerCase(),
            programmes_description: programmes_description.trim()
        });

        // Save to database
        await programme.save();

        res.status(201).json({
            message: "Programme created successfully",
            programme
        });
    } catch (error) {
        console.error("Error creating programme:", error);
        // Check for duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A programme with this name already exists",
                error: error.message
            });
        }
        res.status(500).json({
            message: "Error creating programme",
            error: error.message
        });
    }
});

// Get all programmes
router.get('/', async (req, res) => {
    try {
        const programmes = await Programme.find().sort({ name: 1 }); // Sort by name
        res.status(200).json(programmes);
    } catch (error) {
        console.error("Error fetching programmes:", error);
        res.status(500).json({
            message: "Error fetching programmes",
            error: error.message
        });
    }
});

// Get programme by ID
router.get('/:id', async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid programme ID format" });
        }

        const programme = await Programme.findById(req.params.id);
        if (!programme) {
            return res.status(404).json({ message: "Programme not found" });
        }
        res.status(200).json(programme);
    } catch (error) {
        console.error("Error fetching programme:", error);
        res.status(500).json({
            message: "Error fetching programme",
            error: error.message
        });
    }
});

// Update programme
router.put('/:id', async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid programme ID format" });
        }

        const { name, programme_type, programmes_description } = req.body;
        const updates = {};

        // Validate and add fields if they exist
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    message: "Programme name must be a non-empty string"
                });
            }
            updates.name = name.trim();
        }

        if (programme_type !== undefined) {
            const allowedTypes = ['research', 'development', 'innovation', 'education', 'community'];
            if (typeof programme_type !== 'string' || !allowedTypes.includes(programme_type.toLowerCase())) {
                return res.status(400).json({
                    message: "Invalid programme type. Must be one of: " + allowedTypes.join(', ')
                });
            }
            updates.programme_type = programme_type.toLowerCase();
        }

        if (programmes_description !== undefined) {
            if (typeof programmes_description !== 'string' || programmes_description.trim().length === 0) {
                return res.status(400).json({
                    message: "Programme description must be a non-empty string"
                });
            }
            updates.programmes_description = programmes_description.trim();
        }

        const programme = await Programme.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!programme) {
            return res.status(404).json({ message: "Programme not found" });
        }

        res.status(200).json({
            message: "Programme updated successfully",
            programme
        });
    } catch (error) {
        console.error("Error updating programme:", error);
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A programme with this name already exists",
                error: error.message
            });
        }
        res.status(500).json({
            message: "Error updating programme",
            error: error.message
        });
    }
});

// Delete programme
router.delete('/:id', async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid programme ID format" });
        }

        const programme = await Programme.findByIdAndDelete(req.params.id);
        if (!programme) {
            return res.status(404).json({ message: "Programme not found" });
        }
        res.status(200).json({
            message: "Programme deleted successfully",
            deletedProgramme: programme
        });
    } catch (error) {
        console.error("Error deleting programme:", error);
        res.status(500).json({
            message: "Error deleting programme",
            error: error.message
        });
    }
});

module.exports = router; 