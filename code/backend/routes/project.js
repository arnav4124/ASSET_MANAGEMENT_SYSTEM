const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const User = require('../models/user');
const Location = require('../models/location');
const authMiddleware = require('../middleware/auth');
const UserProject = require('../models/user_project');
const AssetProject = require('../models/asset_project');
const Asset = require('../models/asset');
const mongoose = require('mongoose');
const History = require('../models/history');

// createAssetHistory helper function for tracking asset changes
const createAssetHistory = async (params) => {
    try {
        // Check for required fields
        if (!params.asset_id) throw new Error('Asset ID is required');
        if (!params.performed_by) throw new Error('Performed by (admin ID) is required');
        if (!params.operation_type) throw new Error('Operation type is required');
        let comment = params.comments || '';

        // Create new history object with all provided fields
        const historyEntry = new History({
            asset_id: params.asset_id,
            performed_by: params.performed_by,
            operation_type: params.operation_type,
            // Optional fields
            assignment_type: params.assignment_type,
            issued_to: params.issued_to,
            // operation_time will default to current time if not provided
            operation_time: params.operation_time || Date.now(),
            comments: comment,
            // Add old_location and new_location fields if provided
            old_location: params.old_location || '',
            new_location: params.new_location || ''
        });

        // Save the history record
        await historyEntry.save();
        console.log('Asset history recorded successfully');
        return historyEntry;
    } catch (error) {
        console.error('Failed to record asset history:', error);
        throw error;
    }
};

// Helper function to validate date format
function isValidDate(dateString) {
    // Check if the string is a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// Improved function to find all sublocations in the hierarchy
async function findAllSublocations(parentLocationName) {
    try {
        console.log(`Finding sublocations for: ${parentLocationName}`);

        // Start with the parent location itself
        const locations = [parentLocationName];
        const processedLocations = new Set(); // To prevent infinite recursion

        // Find parent location document
        const parentLocation = await Location.findOne({ location_name: parentLocationName });
        if (!parentLocation) {
            console.log(`Parent location document not found for: ${parentLocationName}`);
            return locations;
        }

        // Define a recursive helper function to find all nested sublocations
        async function findSublocationsRecursively(locationDoc) {
            // Skip if we've already processed this location
            const locationId = locationDoc._id.toString();
            if (processedLocations.has(locationId)) {
                return;
            }

            // Mark this location as processed
            processedLocations.add(locationId);

            try {
                // Find all direct children of this location using its ID
                const children = await Location.find({ parent_location: locationDoc._id.toString() });
                console.log(`Found ${children.length} direct children for location: ${locationDoc.location_name}`);

                // Process each child
                for (const child of children) {
                    // Add the child location to our list if not already included
                    if (!locations.includes(child.location_name)) {
                        locations.push(child.location_name);
                        console.log(`Added sublocation: ${child.location_name}`);
                    }

                    // Recursively process this child's children
                    await findSublocationsRecursively(child);
                }
            } catch (err) {
                console.error(`Error finding children for location ${locationDoc.location_name}:`, err);
            }
        }

        // Start the recursive search from the parent location
        await findSublocationsRecursively(parentLocation);

        console.log(`Found total ${locations.length} locations in hierarchy for ${parentLocationName}`);
        return locations;
    } catch (error) {
        console.error(`Error finding sublocations for ${parentLocationName}:`, error);
        return [parentLocationName];
    }
}

// Get all users with role 'User' or 'Admin'
router.get('/users', authMiddleware, async (req, res) => {
    try {
        // Get current admin's location
        const adminLocation = req.user.location;

        console.log(`Admin location: ${adminLocation}`);

        // Find all sublocations (including the admin's location)
        const validLocations = await findAllSublocations(adminLocation);

        console.log(`Found ${validLocations.length} locations in hierarchy, including: ${validLocations.slice(0, 5).join(', ')}${validLocations.length > 5 ? '...' : ''}`);

        // Use direct MongoDB query to find matching users
        const users = await User.find({
            role: { $in: ['User', 'Admin'] },
            location: { $in: validLocations }
        });

        console.log(`Found ${users.length} users in the location hierarchy`);

        // Log sample of users and their locations
        if (users.length > 0) {
            console.log("Sample of users found (up to 5):");
            users.slice(0, 5).forEach(user => {
                console.log(`- User: ${user.first_name} ${user.last_name}, Location: "${user.location}"`);
            });

            // Count users by location
            const locationCounts = {};
            for (const user of users) {
                locationCounts[user.location] = (locationCounts[user.location] || 0) + 1;
            }

            console.log("User counts by location:");
            Object.entries(locationCounts)
                .sort((a, b) => b[1] - a[1])  // Sort by count, descending
                .slice(0, 10)  // Take top 10
                .forEach(([location, count]) => {
                    console.log(`- ${location}: ${count} users`);
                });
        }

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

        // Validate deadline format if provided
        if (deadline && !isValidDate(deadline)) {
            return res.status(400).json({
                message: "Invalid deadline date format"
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
        // Get current admin's location
        const adminLocation = req.user.location;
        console.log(`Admin location for projects: ${adminLocation}`);

        // Find all sublocations (including the admin's location)
        const validLocations = await findAllSublocations(adminLocation);
        console.log(`Found ${validLocations.length} locations in hierarchy for projects`);

        // Find all projects where at least one location matches the admin's location hierarchy
        const projects = await Project.find()
            .populate('project_head', 'first_name last_name email')
            .sort({ createdAt: -1 });
        
        // Filter projects to only include those with at least one location in the admin's hierarchy
        const filteredProjects = projects.filter(project => {
            // Check if any of the project's locations are in the admin's location hierarchy
            return project.location.some(loc => validLocations.includes(loc));
        });

        console.log(`Found ${filteredProjects.length} projects within admin's location hierarchy out of ${projects.length} total projects`);
        
        res.status(200).json(filteredProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get project by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

        const project = await Project.findById(req.params.id)
            .populate('project_head', 'first_name last_name email');

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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

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

// Get project participants
router.get('/:id/participants', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

        const userProjects = await UserProject.find({ project_id: req.params.id })
            .populate('user_id', 'first_name last_name email role');

        const participants = userProjects.map(up => up.user_id);
        res.status(200).json(participants);
    } catch (error) {
        console.error('Error fetching project participants:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add assets to project
router.post('/:projectId/assets', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { assetIds } = req.body; // Array of asset IDs to add
        const adminLocation = req.user.location;

        console.log(`Admin location for assets: ${adminLocation}`);
        console.log(`Asset IDs to add: ${JSON.stringify(assetIds)}`);

        // Validate project exists
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Validate asset IDs
        if (!Array.isArray(assetIds) || assetIds.length === 0) {
            return res.status(400).json({ message: "No asset IDs provided" });
        }

        // Find all sublocations (including the admin's location)
        const validLocations = await findAllSublocations(adminLocation);
        console.log(`Found ${validLocations.length} valid locations in hierarchy for admin`);

        // Find all assets from the list that match admin's location hierarchy and are available
        const validAssets = await Asset.find({
            _id: { $in: assetIds },
            Office: { $in: validLocations },
            status: 'Available'
        });

        console.log(`Found ${validAssets.length} valid assets out of ${assetIds.length} requested`);

        // Debug: Let's see what assets we found and their locations
        console.log("Valid assets:");
        for (const asset of validAssets) {
            console.log(`- Valid asset: ${asset.name}, Location: "${asset.Office}"`);
        }

        // Debug: Check if any assets weren't found or are unavailable
        const validAssetIds = validAssets.map(asset => asset._id.toString());
        const invalidAssetIds = assetIds.filter(id => !validAssetIds.includes(id));

        if (invalidAssetIds.length > 0) {
            console.log(`Invalid or unavailable asset IDs: ${JSON.stringify(invalidAssetIds)}`);
        }

        // Filter out assets that are already in the project
        const existingAssets = await AssetProject.find({
            project_id: projectId,
            asset_id: { $in: assetIds }
        });

        const existingAssetIds = existingAssets.map(ap => ap.asset_id.toString());
        const newAssetIds = validAssetIds.filter(id => !existingAssetIds.includes(id));

        // Create new asset-project associations
        const assetProjects = newAssetIds.map(assetId => ({
            asset_id: assetId,
            project_id: projectId
        }));

        if (assetProjects.length > 0) {
            await AssetProject.insertMany(assetProjects);

            // Update all assigned assets with project information
            for (const assetId of newAssetIds) {
                await Asset.findByIdAndUpdate(
                    assetId,
                    {
                        status: 'Unavailable',
                        assignment_status: true,
                        Issued_to: projectId,
                        Issued_to_type: 'Project',
                        Issued_date: new Date()
                    }
                );

                // Create history record for the assignment
                await createAssetHistory({
                    asset_id: assetId,
                    performed_by: req.user._id,
                    operation_type: 'Assigned',
                    assignment_type: 'Project',
                    issued_to: projectId,
                    comments: `Asset assigned to project: ${project.Project_name}`
                });
            }

            console.log(`Updated ${newAssetIds.length} assets with assignment to project ${projectId}`);
        }

        res.status(201).json({
            message: 'Assets added successfully',
            added: newAssetIds.length,
            skipped: assetIds.length - newAssetIds.length,
            invalid: invalidAssetIds
        });
    } catch (error) {
        console.error('Error adding assets:', error);
        res.status(500).json({ message: 'Error adding assets', error: error.message });
    }
});

// Remove asset from project
router.delete('/:projectId/assets/:assetId', authMiddleware, async (req, res) => {
    try {
        const { projectId, assetId } = req.params;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(assetId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the asset-project association exists
        const assetProject = await AssetProject.findOne({
            project_id: projectId,
            asset_id: assetId
        });

        if (!assetProject) {
            return res.status(404).json({ message: 'Asset not assigned to this project' });
        }

        // Delete the asset-project association
        await AssetProject.findByIdAndDelete(assetProject._id);

        // Update the asset status to available and remove project assignment
        const asset = await Asset.findByIdAndUpdate(
            assetId,
            {
                status: 'Available',
                assignment_status: false,
                Issued_to: null,
                Issued_to_type: null
            },
            { new: true }
        );

        // Create history record for the unassignment
        await createAssetHistory({
            asset_id: assetId,
            performed_by: req.user._id,
            operation_type: 'Unassigned',
            assignment_type: 'Project',
            issued_to: null,
            comments: `Asset removed from project: ${project.Project_name}`
        });

        res.status(200).json({
            message: 'Asset removed from project successfully'
        });
    } catch (error) {
        console.error('Error removing asset from project:', error);
        res.status(500).json({ message: 'Error removing asset from project', error: error.message });
    }
});

// Get project assets
router.get('/:id/assets', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid project ID format" });
        }

        const assetProjects = await AssetProject.find({ project_id: req.params.id })
            .populate({
                path: 'asset_id',
                populate: {
                    path: 'category'
                }
            });

        const assets = assetProjects.map(ap => ap.asset_id);
        console.log(assets);
        res.status(200).json(assets);
    } catch (error) {
        console.error('Error fetching project assets:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/get_user_projects/:id', authMiddleware, async (req, res) => {
    try {
        const userProjects = await UserProject.find({ user_id: req.params.id });
        const projectIds = userProjects.map(up => up.project_id);
        const pros = []
        for (let i = 0; i < projectIds.length; i++) {
            const project = await Project.findById(projectIds[i]);
            pros.push(project);
        }
        res.status(200).json(pros);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching user projects' });
    }
})

// Get all users (with search functionality)
router.get('/users/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        // Get current admin's location
        const adminLocation = req.user.location;

        console.log(`Admin location for search: ${adminLocation}`);
        console.log(`Search query: "${query}"`);

        // Find all sublocations (including the admin's location)
        const validLocations = await findAllSublocations(adminLocation);

        console.log(`Found ${validLocations.length} locations in hierarchy for admin location: ${adminLocation}`);

        // Get all users
        let searchConditions = {
            location: { $in: validLocations }
        };

        // Add search query filter if provided
        if (query && query.trim() !== '') {
            searchConditions.$or = [
                { first_name: { $regex: query, $options: 'i' } },
                { last_name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        // Find users with the built query
        const filteredUsers = await User.find(searchConditions)
            .select('first_name last_name email role location');

        console.log(`Found ${filteredUsers.length} users matching both location hierarchy and search criteria`);

        res.json(filteredUsers);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get all assets which have location as user location(with search functionality)
router.get('/assets/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        let searchQuery = {};
        if (query) {
            searchQuery = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { brand: { $regex: query, $options: 'i' } },
                    { Office: { $regex: query, $options: 'i' } },
                    { Serial_number: { $regex: query, $options: 'i' } }
                ]
            };
        }

        // For Admin, show all assets without filtering by location or status
        const user = req.user;
        if (user.role !== 'Admin') {
            const userLocation = user.location;
            searchQuery.Office = userLocation;
            searchQuery.status = 'Available';
        }

        const assets = await Asset.find(searchQuery)
            .populate({
                path: 'category',
                select: 'name'
            })
            .populate({
                path: 'Issued_by',
                select: 'first_name last_name email'
            });

        res.status(200).json(assets);
    } catch (error) {
        console.error('Error searching assets:', error);
        res.status(500).json({ message: 'Server error while searching assets' });
    }
});

// Add participants to project
router.post('/:projectId/participants', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userIds } = req.body; // Array of user IDs to add
        const adminLocation = req.user.location;

        console.log(`Admin location for participants: ${adminLocation}`);
        console.log(`User IDs to add: ${JSON.stringify(userIds)}`);

        // Find all sublocations (including the admin's location)
        const validLocations = await findAllSublocations(adminLocation);
        console.log(`Found ${validLocations.length} valid locations in hierarchy for admin`);

        // Validate project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Find all users from the list that match admin's location hierarchy
        const validUsers = await User.find({
            _id: { $in: userIds },
            location: { $in: validLocations }
        });

        console.log(`Found ${validUsers.length} valid users out of ${userIds.length} requested`);

        // Debug: Let's see what users we found and what locations they have
        console.log("Valid users:");
        for (const user of validUsers) {
            console.log(`- Valid user: ${user.first_name} ${user.last_name}, Location: "${user.location}"`);
        }

        // Debug: Check if any users weren't found and print their locations
        const validUserIds = validUsers.map(user => user._id.toString());
        const invalidUserIds = userIds.filter(id => !validUserIds.includes(id));

        if (invalidUserIds.length > 0) {
            console.log(`Invalid user IDs: ${JSON.stringify(invalidUserIds)}`);

            // Let's check the actual locations of these invalid users
            const invalidUsers = await User.find({ _id: { $in: invalidUserIds } });

            console.log("Invalid users with their locations:");
            for (const user of invalidUsers) {
                console.log(`- Invalid user: ${user.first_name} ${user.last_name}, Location: "${user.location}"`);
            }
        }

        // If some users don't match location criteria, return error
        if (validUserIds.length !== userIds.length) {
            return res.status(400).json({
                message: 'Some users cannot be added as they do not belong to your location hierarchy',
                valid: validUserIds,
                invalid: userIds.filter(id => !validUserIds.includes(id))
            });
        }

        // Filter out users that are already in the project
        const existingParticipants = await UserProject.find({
            project_id: projectId,
            user_id: { $in: userIds }
        });

        const existingUserIds = existingParticipants.map(p => p.user_id.toString());
        const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

        // Create new user-project associations
        const userProjects = newUserIds.map(userId => ({
            user_id: userId,
            project_id: projectId
        }));

        await UserProject.insertMany(userProjects);

        res.status(201).json({
            message: 'Participants added successfully',
            added: newUserIds.length,
            skipped: userIds.length - newUserIds.length
        });
    } catch (error) {
        console.error('Error adding participants:', error);
        res.status(500).json({ message: 'Error adding participants', error: error.message });
    }
});

// Diagnostic endpoint to check users by location
router.get('/diagnostic/users-by-location', authMiddleware, async (req, res) => {
    try {
        const adminLocation = req.user.location;
        console.log(`Admin location for diagnostic: ${adminLocation}`);

        // Step 1: Get information about the current location
        const currentLocationDoc = await Location.findOne({ location_name: adminLocation });

        if (!currentLocationDoc) {
            return res.status(404).json({
                success: false,
                message: `Admin location "${adminLocation}" not found in the database`
            });
        }

        // Step 2: Get all locations using our recursive function
        const allSubLocations = await findAllSublocations(adminLocation);

        // Step 3: Get the full location documents for all sublocations
        const locationDocs = await Location.find({
            location_name: { $in: allSubLocations }
        });

        // Step 4: Build a location hierarchy map
        const locationMap = {};
        for (const loc of locationDocs) {
            // Determine parent ID - handle both ObjectId and string cases
            let parentId = "root";
            if (loc.parent_location && loc.parent_location !== "ROOT") {
                // Convert to string if it's an ObjectId
                parentId = typeof loc.parent_location === 'object' && loc.parent_location._id
                    ? loc.parent_location._id.toString()
                    : loc.parent_location.toString();
            }

            locationMap[loc._id.toString()] = {
                id: loc._id.toString(),
                name: loc.location_name,
                parent: parentId,
                type: loc.location_type,
                children: []
            };
        }

        // Step 5: Build the hierarchy tree
        for (const locId in locationMap) {
            const loc = locationMap[locId];
            if (loc.parent && loc.parent !== "root" && locationMap[loc.parent]) {
                locationMap[loc.parent].children.push(locId);
            }
        }

        // Step 6: Find all users in the database
        const allUsers = await User.find({}).select('first_name last_name email role location');

        // Step 7: Find users that match our valid locations
        const matchingUsers = allUsers.filter(user =>
            allSubLocations.includes(user.location)
        );

        // Step 8: Count users by location
        const usersByLocation = {};
        for (const location of allSubLocations) {
            usersByLocation[location] = allUsers.filter(user =>
                user.location === location
            ).length;
        }

        // Step 9: Count locations we found vs locations with users
        const locationsWithUsers = Object.keys(usersByLocation).filter(loc =>
            usersByLocation[loc] > 0
        );

        const diagnosticData = {
            adminLocation,
            currentLocationDetails: {
                _id: currentLocationDoc._id.toString(),
                name: currentLocationDoc.location_name,
                type: currentLocationDoc.location_type,
                parent: currentLocationDoc.parent_location === "ROOT"
                    ? "ROOT"
                    : currentLocationDoc.parent_location.toString()
            },
            allSubLocationsCount: allSubLocations.length,
            allSubLocations,
            locationHierarchy: locationMap,
            totalUsers: allUsers.length,
            matchingUsers: matchingUsers.length,
            usersByLocation,
            locationsWithUsers: locationsWithUsers.length,
            locationsWithNoUsers: allSubLocations.length - locationsWithUsers.length,
            // Top locations by user count
            topLocations: Object.entries(usersByLocation)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
        };

        res.json({
            success: true,
            diagnosticData
        });
    } catch (error) {
        console.error('Error in diagnostic endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error running diagnostics',
            error: error.message
        });
    }
});

// Get all available assets for projects
router.get('/assets', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const adminLocation = user.location;

        // Get all locations in the hierarchy for admin
        const validLocations = await findAllSublocations(adminLocation);
        console.log(`Found ${validLocations.length} valid locations for asset filtering`);

        // Find assets that are available
        let query = {
            status: 'Available',
            Office: { $in: validLocations }
        };

        const assets = await Asset.find(query)
            .populate({
                path: 'category',
                select: 'name'
            })
            .populate({
                path: 'Issued_by',
                select: 'first_name last_name email'
            });

        console.log(`Found ${assets.length} available assets for admin's location hierarchy`);

        res.status(200).json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ message: 'Server error while fetching assets' });
    }
});

// Get locations within admin's hierarchy for project creation
router.get('/locations/admin-hierarchy', authMiddleware, async (req, res) => {
    try {
        // Get current admin's location
        const adminLocation = req.user.location;
        console.log(`Admin location for location hierarchy: ${adminLocation}`);

        // Find all sublocations (including the admin's location)
        const validLocationNames = await findAllSublocations(adminLocation);
        console.log(`Found ${validLocationNames.length} locations in hierarchy`);

        // Get the full location documents for these location names
        const locations = await Location.find({
            location_name: { $in: validLocationNames }
        });

        console.log(`Returning ${locations.length} location documents`);
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching admin location hierarchy:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;