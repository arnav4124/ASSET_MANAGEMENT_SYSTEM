const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

// Route to assign admin role to an existing user
router.post('/assign', authMiddleware, async (req, res) => {
    try {
        let { firstName, lastName, email } = req.body;
        console.log(firstName, lastName, email);

        // trim all the strings
        firstName = firstName.trim();
        lastName = lastName.trim();
        email = email.trim();
        console.log(firstName, lastName, email);

        // Check if user exists with given credentials - case insensitive for names
        const existingUser = await User.findOne({
            email: email,
            $and: [
                { first_name: { $regex: new RegExp(`^${firstName}$`, 'i') } },
                { last_name: { $regex: new RegExp(`^${lastName}$`, 'i') } }
            ]
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No user found with the provided credentials"
            });
        }

        // Check if user is already an admin
        if (existingUser.role === 'Admin') {
            return res.status(400).json({
                success: false,
                message: "User is already an admin"
            });
        }

        // Check if an admin already exists for this location
        const existingAdmin = await User.findOne({
            location: existingUser.location,
            role: 'Admin'
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: `Cannot assign admin role. There's already an admin (${existingAdmin.first_name} ${existingAdmin.last_name}) for ${existingUser.location} location.`
            });
        }

        // Update user role to Admin
        existingUser.role = 'Admin';
        await existingUser.save();

        res.status(200).json({
            success: true,
            message: "User has been successfully assigned as admin",
            user: {
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                role: existingUser.role,
                location: existingUser.location
            }
        });

    } catch (error) {
        console.error('Error assigning admin role:', error);
        res.status(500).json({
            success: false,
            message: "Error assigning admin role",
            error: error.message
        });
    }
});

module.exports = router;




