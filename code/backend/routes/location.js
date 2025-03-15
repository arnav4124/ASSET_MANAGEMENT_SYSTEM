const express = require('express')
const location_router = express.Router()
const Location = require('../models/location')
const authMiddleware = require('../middleware/auth')
const User = require('../models/user')

location_router.get('/get_cities', authMiddleware, async (req, res) => {
    console.log("CHECKKK")
    try {
        const locations = await Location.find({ parent_location: "ROOT" })
        const response = [
            {
                _id: "ROOT",
                location_name: "ROOT",
                location_type: "ROOT",
            },
            ...locations
        ]
        console.log(response)
        return res.status(200).json(response)
    }
    catch (error) {
        console.error("Error fetching location:", error);
        res.status(500).json({
            message: "Error fetching location",
            error: error.message
        });
    }
})

location_router.post('/add_location', authMiddleware, async (req, res) => {
    try {
        const { location_name, location_type, parent_location, address, pincode } = req.body
        console.log(req.body)
        const location = new Location({
            location_name,
            location_type,
            parent_location,
            address,
            pincode
        })
        await location.save()
        console.log(response)
        res.status(200).json({ success: true, message: "Location added successfully" })
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Error in adding location" })
    }
})


location_router.get('/', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find({})
            .populate({
                path: 'parent_location',
                match: { _id: { $ne: "ROOT" } }, // only populate if _id != "ROOT"
            });

        res.status(200).json(locations);
    } catch (error) {
        console.error("Error fetching location:", error);
        res.status(500).json({
            message: "Error fetching location",
            error: error.message
        });
    }
}
)


location_router.get('/get_all_cities', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find({})
        const location_name_list = []  // Use const
        for (let i = 0; i < locations.length; i++) {  // Use let for i
            location_name_list.push(locations[i].location_name)
        }
        console.log(location_name_list)
        return res.status(200).json(location_name_list)
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error in fetching locations" })
    }
})

location_router.get("/admin-locations", authMiddleware, async (req, res) => {
    try {
        // 1) Find current user (assumes req.user._id is set by authMiddleware)
        console.log(req.user)
        const currentUser = await User.findById(req.user.id);
        console.log(currentUser)
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2) Verify admin role
        if (currentUser.role !== "Admin") {
            return res.status(403).json({ message: "Forbidden. Only Admin can access this." });
        }

        console.log(currentUser.location)

        // 3) Find parent location doc whose location_name == admin's user.location
        const parentLocationDoc = await Location.findOne({ location_name: currentUser.location });
        console.log(parentLocationDoc)
        if (!parentLocationDoc) {
            return res.status(404).json({
                message: `No matching location doc found for ${currentUser.location}`
            });
        }

        // 4) Fetch child locations whose parent_location matches the parent's _id
        const childLocations = await Location.find({ parent_location: parentLocationDoc.id });
        console.log(childLocations)
        // 5) Return the filtered locations
        res.status(200).json(childLocations);
    } catch (error) {
        console.error("Error fetching child locations:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = location_router
