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

        // Check if user exists with given credentials
        const existingUser = await User.findOne({
            email: email,
            first_name: firstName,
            last_name: lastName
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
                role: existingUser.role
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




