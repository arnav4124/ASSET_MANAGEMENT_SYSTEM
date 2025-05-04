const express = require('express');
const { loginUser } = require('../controllers/userController.js');
const userRouter = express.Router();
const authMiddleware = require('../middleware/auth')
// Import necessary models
const User = require('../models/user');
const Location = require('../models/location');


userRouter.post('/login', loginUser);

userRouter.get("/", authMiddleware ,async (req, res) => {
    try {
        console.log("Fetching users in userRouter");
        const { adminLocation } = req.query;
        console.log("Admin location", adminLocation);
        
        if (!adminLocation) {
            // Fallback: return all users or handle as needed
            console.log("fetching all users, no adminLocation provided");
            const allUsers = await User.find({});
            return res.status(200).json(allUsers);
        }

        // Find admin's location document
        const adminLocationDoc = await Location.findOne({ location_name: adminLocation });
        if (!adminLocationDoc) {
            console.log(`Location not found for ${adminLocation}`);
            return res.status(404).json({ error: "Location not found" });
        }
        
        console.log(`Found location document for ${adminLocation}, ID: ${adminLocationDoc._id}`);

        // Query for child locations (try both string and ObjectId formats)
        const childLocationsObjectId = await Location.find({ parent_location: adminLocationDoc._id });
        const childLocationsString = await Location.find({ parent_location: adminLocationDoc._id.toString() });
        
        // Combine and deduplicate
        const childLocationsMap = new Map();
        [...childLocationsObjectId, ...childLocationsString].forEach(loc => {
            if (!childLocationsMap.has(loc._id.toString())) {
                childLocationsMap.set(loc._id.toString(), loc);
            }
        });
        
        const childLocations = Array.from(childLocationsMap.values());
        console.log(`Found ${childLocations.length} child locations`);
        
        // Find all grandchild locations
        let allGrandchildLocationsMap = new Map();
        
        for (const childLocation of childLocations) {
            console.log(`Finding grandchildren for location: ${childLocation.location_name}`);
            
            const grandchildObjectId = await Location.find({ parent_location: childLocation._id });
            const grandchildString = await Location.find({ parent_location: childLocation._id.toString() });
            
            [...grandchildObjectId, ...grandchildString].forEach(loc => {
                if (!allGrandchildLocationsMap.has(loc._id.toString())) {
                    allGrandchildLocationsMap.set(loc._id.toString(), loc);
                }
            });
        }
        
        const allGrandchildLocations = Array.from(allGrandchildLocationsMap.values());
        console.log(`Found ${allGrandchildLocations.length} grandchild locations`);
        
        // Gather all location names from the hierarchy
        const validLocationNames = [
            adminLocation,
            ...childLocations.map(loc => loc.location_name),
            ...allGrandchildLocations.map(loc => loc.location_name)
        ];
        
        console.log(`Filtering users for locations: ${validLocationNames.join(', ')}`);
        
        // Now fetch all active users whose location matches any of these locations
        const filteredUsers = await User.find({ 
            location: { $in: validLocationNames },
            active: { $ne: false }  // Exclude inactive users
        });
        
        console.log(`Found ${filteredUsers.length} users in the location hierarchy`);
        return res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
});

userRouter.get("/search", async (req, res) => {
    try {
        const { query, location } = req.query;
        console.log("Searching users with query:", query, "in location:", location);

        if (!location) {
            return res.status(400).json({ error: "Location is required" });
        }

        let searchCondition = { location };

        // Add name search if query is provided
        if (query && query.trim() !== '') {
            searchCondition.$or = [
                { first_name: { $regex: query, $options: 'i' } },
                { last_name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        const users = await User.find(searchCondition);
        // remove users with inactive sttus
        const activeUsers = users.filter(user => user.active !== false);
        // users = activeUsers;
        console.log(`Found ${users.length} users matching criteria`);

        return res.status(200).json(activeUsers);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Error searching users" });
    }
});

module.exports = userRouter;