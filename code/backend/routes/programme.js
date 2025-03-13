const express = require('express');
const router = express.Router();
const Programme = require('../models/programme');

// Create a new programme
router.post('/', async (req, res) => {
    try {
        const { name, programme_type, programmes_description } = req.body;

        // Validate required fields
        if (!name || !programme_type || !programmes_description) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Create new programme
        const programme = new Programme({
            name,
            programme_type,
            programmes_description
        });

        // Save to database
        await programme.save();

        res.status(201).json({
            message: "Programme created successfully",
            programme
        });
    } catch (error) {
        console.error("Error creating programme:", error);
        res.status(500).json({
            message: "Error creating programme",
            error: error.message
        });
    }
});

// // Get all programmes
// router.get('/', async (req, res) => {
//     try {
//         const programmes = await Programme.find();
//         res.status(200).json(programmes);
//     } catch (error) {
//         res.status(500).json({
//             message: "Error fetching programmes",
//             error: error.message
//         });
//     }
// });

// // Get programme by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const programme = await Programme.findById(req.params.id);
//         if (!programme) {
//             return res.status(404).json({ message: "Programme not found" });
//         }
//         res.status(200).json(programme);
//     } catch (error) {
//         res.status(500).json({
//             message: "Error fetching programme",
//             error: error.message
//         });
//     }
// });

// // Update programme
// router.put('/:id', async (req, res) => {
//     try {
//         const { name, programme_type, programmes_description } = req.body;
//         const programme = await Programme.findById(req.params.id);

//         if (!programme) {
//             return res.status(404).json({ message: "Programme not found" });
//         }

//         programme.name = name || programme.name;
//         programme.programme_type = programme_type || programme.programme_type;
//         programme.programmes_description = programmes_description || programme.programmes_description;

//         await programme.save();
//         res.status(200).json({
//             message: "Programme updated successfully",
//             programme
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Error updating programme",
//             error: error.message
//         });
//     }
// });

// // Delete programme
// router.delete('/:id', async (req, res) => {
//     try {
//         const programme = await Programme.findByIdAndDelete(req.params.id);
//         if (!programme) {
//             return res.status(404).json({ message: "Programme not found" });
//         }
//         res.status(200).json({ message: "Programme deleted successfully" });
//     } catch (error) {
//         res.status(500).json({
//             message: "Error deleting programme",
//             error: error.message
//         });
//     }
// });

module.exports = router; 