const express = require('express');
const { loginUser } = require('../controllers/userController.js');
const userRouter = express.Router();

// Import necessary models
const User = require('../models/user');
const Location = require('../models/location');


userRouter.post('/login', loginUser);

userRouter.get("/", async (req, res) => {
    try {
        console.log("Fetching users in userRouter");
        const { adminLocation } = req.query;
        console.log("Admin location", adminLocation);
        if (!adminLocation) {
            // Fallback: return all users or handle as needed
            console.log("fetching all users, no adminlocation")
            const allUsers = await User.find({});
            return res.status(200).json(allUsers);
        }

        // Find location docs where parent_location == adminLocation or _id == adminLocation
        // get location id from location name
        const adminLocationDoc = await Location.findOne({ location_name: adminLocation });
        if (!adminLocationDoc) {
            return res.status(404).json({ error: "Location not found" });
        }
        const adminLocationId = adminLocationDoc.id;
        console.log("Admin location ID", adminLocationId);
        const validLocations = await Location.find({
            $or: [{ _id: adminLocationId }, { parent_location: adminLocationId }]
        }).select("_id location_name");
        console.log("Valid locations", validLocations);


        const validLocationNames = validLocations.map((loc) => loc.location_name);
        console.log("Valid location names", validLocationNames);
        // Now fetch only users whose location_id is in validLocationIds
        const filteredUsers = await User.find({ location: { $in: validLocationNames } });
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