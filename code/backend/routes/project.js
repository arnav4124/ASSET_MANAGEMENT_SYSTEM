const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const User = require('../models/user');
const Location = require('../models/location');
const authMiddleware = require('../middleware/auth');
const UserProject = require('../models/user_project');

// Get all users with role 'User' or 'Admin'
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['User', 'Admin'] } });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all locations
router.get('/locations', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new project
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            Project_name,
            programme_name,
            project_head,
            location,
            deadline,
            description,
            participants
        } = req.body;

        // Validate required fields
        if (!Project_name || !programme_name || !project_head || !location || !description) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // Validate project head exists
        const projectHeadExists = await User.findById(project_head);
        if (!projectHeadExists) {
            return res.status(400).json({
                message: "Invalid project head"
            });
        }

        // Create new project
        const project = new Project({
            Project_name,
            programme_name,
            project_head,
            location,
            description,
            deadline: deadline || undefined
        });

        // Save project
        await project.save();

        // If there are participants, create user-project associations
        if (participants && participants.length > 0) {
            const userProjectPromises = participants.map(userId =>
                new UserProject({
                    user_id: userId,
                    project_id: project._id
                }).save()
            );
            await Promise.all(userProjectPromises);
        }

        res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            message: "Error creating project",
            error: error.message
        });
    }
});

// Get all projects
router.get('/', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('project_head', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get project by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('project_head', 'name email');

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update project
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({
            message: "Project updated successfully",
            project
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete project
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Also delete associated user-project records
        await UserProject.deleteMany({ project_id: req.params.id });

        res.status(200).json({
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;



