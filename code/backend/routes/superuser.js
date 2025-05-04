const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Asset = require('../models/asset');
const authMiddleware = require('../middleware/auth');
const Location = require('../models/location');
const User = require('../models/user');
const Programme = require('../models/programme');
const Project = require('../models/project');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const mongoose = require('mongoose');

// Add a new category
router.post('/add_category', authMiddleware, async (req, res) => {
    try {
        const { name, description, sticker_short_seq, lifespan, depreciation_rate } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        // Validate depreciation_rate
        if (depreciation_rate === undefined || depreciation_rate === null || depreciation_rate === '') {
            return res.status(400).json({
                success: false,
                message: "Depreciation rate is required"
            });
        }

        const depreciationRateNumber = Number(depreciation_rate);
        if (isNaN(depreciationRateNumber) || depreciationRateNumber < 0) {
            return res.status(400).json({
                success: false,
                message: "Depreciation rate must be a positive number"
            });
        }

        // Create new category
        const categoryData = new Category({
            name: name.trim(),
            description: description.trim(),
            sticker_short_seq: sticker_short_seq.trim(),
            depreciation_rate: depreciationRateNumber
        });

        if (lifespan !== undefined && lifespan !== null && lifespan !== '') {
            // Convert to number to ensure proper data type
            const lifespanNumber = Number(lifespan);

            // Validate lifespan
            if (isNaN(lifespanNumber) || lifespanNumber < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Lifespan must be a positive number"
                });
            }

            categoryData.lifespan = lifespanNumber;
        }
        await categoryData.save();

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            categoryData
        });

    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({
            success: false,
            message: "Error adding category",
            error: error.message
        });
    }
});

// Update a category
router.put('/update_category/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, sticker_short_seq, lifespan, depreciation_rate } = req.body;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if name already exists (but ignore the current category)
        if (name && name.trim() !== category.name) {
            const existingCategory = await Category.findOne({ name: name.trim() });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category with this name already exists"
                });
            }
        }

        // Validate depreciation_rate
        if (depreciation_rate === undefined || depreciation_rate === null || depreciation_rate === '') {
            return res.status(400).json({
                success: false,
                message: "Depreciation rate is required"
            });
        }

        const depreciationRateNumber = Number(depreciation_rate);
        if (isNaN(depreciationRateNumber) || depreciationRateNumber < 0) {
            return res.status(400).json({
                success: false,
                message: "Depreciation rate must be a positive number"
            });
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (description) updateData.description = description.trim();
        if (sticker_short_seq) updateData.sticker_short_seq = sticker_short_seq.trim();
        updateData.depreciation_rate = depreciationRateNumber;

        // Handle lifespan (optional field)
        if (lifespan !== undefined && lifespan !== null && lifespan !== '') {
            const lifespanNumber = Number(lifespan);
            if (isNaN(lifespanNumber) || lifespanNumber < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Lifespan must be a positive number"
                });
            }
            updateData.lifespan = lifespanNumber;
        }

        // Update the category
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory
        });

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: error.message
        });
    }
});

// Get a specific category by ID
router.get('/category/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching category",
            error: error.message
        });
    }
});

// Get all categories
router.get('/categories', authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
});

// Get all locations with hierarchy, user counts, and admin details
router.get('/locations', authMiddleware, async (req, res) => {
    try {
        // Get all locations
        const locations = await Location.find({}).lean();
        console.log(locations)

        // Get all users grouped by location
        const users = await User.find({}).lean();

        // Create a map of location stats
        const locationStats = {};
        locations.forEach(loc => {
            locationStats[loc.location_name.toLowerCase()] = {
                userCount: 0,
                admin: null
            };
        });

        console.log(locationStats)

        // Calculate user counts and find admins for each location
        users.forEach(user => {
            if (locationStats[user.location.toLowerCase()]) {
                console.log("Current location", user.location)
                locationStats[user.location.toLowerCase()].userCount++;
                if (user.role === 'Admin') {
                    locationStats[user.location.toLowerCase()].admin = {
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email
                    };
                }
            }
        });
        // console.log("Location stats", locationStats)

        console.log(locationStats)

        // Build the hierarchy
        const buildHierarchy = (parentLocation) => {

            return locations
                .filter(loc => loc.parent_location === parentLocation)
                .map(loc => ({
                    ...loc,
                    stats: locationStats[loc.location_name.toLowerCase()],
                    children: buildHierarchy(loc._id.toString())
                }));
        };

        // Get root level locations and build tree
        const hierarchicalLocations = buildHierarchy("ROOT");
        console.log("Hierarchical locations", hierarchicalLocations)

        console.log(hierarchicalLocations);

        res.json({
            success: true,
            locations: hierarchicalLocations
        });

    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
});

// Get all programmes with their projects
router.get('/programmes', authMiddleware, async (req, res) => {
    try {
        // Get all programmes
        const programmes = await Programme.find({}).lean();

        // Get all projects
        const projects = await Project.find({})
            .populate('project_head', 'first_name last_name email')
            .lean();

        // Group projects by programme
        const programmeStats = {};
        programmes.forEach(prog => {
            programmeStats[prog.name] = {
                projectCount: 0,
                projects: []
            };
        });

        // Calculate project counts and group projects
        projects.forEach(project => {
            if (programmeStats[project.programme_name]) {
                programmeStats[project.programme_name].projectCount++;
                programmeStats[project.programme_name].projects.push({
                    ...project,
                    project_head_name: `${project.project_head.first_name} ${project.project_head.last_name}`
                });
            }
        });

        // Add stats to programmes
        const programmesWithProjects = programmes.map(prog => ({
            ...prog,
            stats: programmeStats[prog.name] || { projectCount: 0, projects: [] }
        }));

        res.json({
            success: true,
            programmes: programmesWithProjects
        });

    } catch (error) {
        console.error('Error fetching programmes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching programmes',
            error: error.message
        });
    }
});

router.get('/get_categories', authMiddleware, async (req, res) => {
    console.log("GET CATEGORIES")
    try {
        const categories = await Category.find()
        console.log(categories)
        asset_count = []
        for (let i = 0; i < categories.length; i++) {
            asset_count.push(await Asset.countDocuments({ category: categories[i]._id }))
        }
        console.log(asset_count)
        for (let i = 0; i < categories.length; i++) {
            categories[i] = categories[i].toObject()
            categories[i].asset_count = asset_count[i]
        }
        res.status(200).json({
            success: true,
            categories: categories
        })
    }
    catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: err.message
        });
    }
})

router.get('/get_all_admins', authMiddleware, async (req, res) => {
    try {
        const admins = await User.find({ role: "Admin" })
        res.status(200).json({
            success: true,
            admins: admins
        })
    }
    catch (err) {
        console.error("Error fetching admins:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching admins",
            error: err.message
        });
    }
})

// Get location vs users count data for graph
router.get('/location_users_graph', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find({}).lean();
        const users = await User.find({}).lean();

        const locationUserCounts = locations.map(location => {
            const userCount = users.filter(user =>
                user.location.toLowerCase() === location.location_name.toLowerCase()
            ).length;

            return {
                location_name: location.location_name,
                user_count: userCount
            };
        });

        res.status(200).json({
            success: true,
            data: locationUserCounts
        });
    } catch (error) {
        console.error('Error fetching location users graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching location users graph data",
            error: error.message
        });
    }
});

// Get category vs assets count data for graph
router.get('/category_assets_graph', authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find({}).lean();
        const assets = await Asset.find({}).lean();

        const categoryAssetCounts = categories.map(category => {
            const assetCount = assets.filter(asset =>
                asset.category && asset.category.toString() === category._id.toString()
            ).length;

            return {
                category_name: category.name,
                asset_count: assetCount
            };
        });

        res.status(200).json({
            success: true,
            data: categoryAssetCounts
        });
    } catch (error) {
        console.error('Error fetching category assets graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching category assets graph data",
            error: error.message
        });
    }
});

// Get programme vs projects count data for graph
router.get('/programme_projects_graph', authMiddleware, async (req, res) => {
    try {
        const programmes = await Programme.find({}).lean();
        const projects = await Project.find({}).lean();

        const programmeProjectCounts = programmes.map(programme => {
            const projectCount = projects.filter(project =>
                project.programme_name === programme.name
            ).length;

            return {
                programme_name: programme.name,
                project_count: projectCount
            };
        });

        res.status(200).json({
            success: true,
            data: programmeProjectCounts
        });
    } catch (error) {
        console.error('Error fetching programme projects graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching programme projects graph data",
            error: error.message
        });
    }
});

// Get location vs assets count data for graph
router.get('/location_assets_graph', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find({}).lean();
        const assets = await Asset.find({}).lean();

        const locationAssetCounts = locations.map(location => {
            const assetCount = assets.filter(asset =>
                asset.Office.toLowerCase() === location.location_name.toLowerCase()
            ).length;

            return {
                location_name: location.location_name,
                asset_count: assetCount
            };
        });

        res.status(200).json({
            success: true,
            data: locationAssetCounts
        });
    } catch (error) {
        console.error('Error fetching location assets graph data:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching location assets graph data",
            error: error.message
        });
    }
});


router.put('/remove_admin', authMiddleware, async (req, res) => {
    try {
        console.log("Removing admin role");
        const { userId } = req.body;
        console.log("User ID to remove admin role:", userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role !== 'Admin') {
            console.log("User is not an admin");
            return res.status(400).json({ success: false, message: 'User is not an admin' });
        }
        // Revert user to normal user role
        console.log("Reverting user to normal role");
        user.role = 'User';
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'User has been reverted to normal user status',
            user
        });
    } catch (error) {
        console.error('Error removing admin role:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Database backup endpoint
router.post('/database-backup', authMiddleware, async (req, res) => {
    try {
        const { format } = req.body;

        if (!format || !['csv', 'bson', 'json'].includes(format)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid format. Supported formats: csv, bson, json'
            });
        }

        // Create timestamp for unique filename
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const backupDir = path.join(__dirname, '../backups');
        const backupFilename = `backup-${timestamp}`;

        // Ensure backup directory exists
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Get all models data
        const models = [
            { name: 'assets', model: Asset },
            { name: 'users', model: User },
            { name: 'locations', model: Location },
            { name: 'categories', model: Category },
            { name: 'programmes', model: Programme },
            { name: 'projects', model: Project }
        ];

        // Collect data from all models upfront for any format
        const collectionsData = {};
        await Promise.all(models.map(async (modelInfo) => {
            try {
                const data = await modelInfo.model.find({}).lean();
                collectionsData[modelInfo.name] = data;
            } catch (err) {
                console.error(`Error fetching ${modelInfo.name}:`, err);
                collectionsData[modelInfo.name] = [];
            }
        }));

        if (format === 'json') {
            // JSON backup
            const filePath = path.join(backupDir, `${backupFilename}.json`);
            fs.writeFileSync(filePath, JSON.stringify(collectionsData, null, 2));

            return res.download(filePath, `${backupFilename}.json`, (err) => {
                if (err) {
                    console.error(`Download error: ${err}`);
                    return res.status(500).json({
                        success: false,
                        message: 'Error downloading JSON backup',
                        error: err.message
                    });
                }

                // Clean up after sending
                setTimeout(() => {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (cleanupErr) {
                        console.error(`Cleanup error: ${cleanupErr}`);
                    }
                }, 60000);
            });
        }
        else if (format === 'csv') {
            // Create directory for CSV files
            const csvDir = path.join(backupDir, `${backupFilename}-csv`);
            fs.mkdirSync(csvDir, { recursive: true });

            // Generate CSV files
            for (const [modelName, data] of Object.entries(collectionsData)) {
                if (data.length > 0) {
                    try {
                        // Get headers
                        const headers = Object.keys(data[0]);

                        // Generate CSV rows
                        const csvRows = [headers.join(',')]; // Add header row

                        data.forEach(item => {
                            const values = headers.map(header => {
                                const value = item[header];
                                if (value === null || value === undefined) return '';
                                if (typeof value === 'object') {
                                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                                }
                                return `"${String(value).replace(/"/g, '""')}"`;
                            });
                            csvRows.push(values.join(','));
                        });

                        // Write the CSV file
                        fs.writeFileSync(
                            path.join(csvDir, `${modelName}.csv`),
                            csvRows.join('\n')
                        );
                    } catch (csvErr) {
                        console.error(`Error creating CSV file for ${modelName}:`, csvErr);
                    }
                }
            }

            // Generate a zip file with all CSV files
            const zipFilePath = path.join(backupDir, `${backupFilename}-csv.zip`);

            // Check if archiver is available
            try {
                const archiver = require('archiver');

                const output = fs.createWriteStream(zipFilePath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Maximum compression
                });

                // Listen for events
                output.on('close', () => {
                    console.log(`CSV Archive created: ${archive.pointer()} bytes`);

                    // Send the zip file
                    res.download(zipFilePath, `database-backup-csv-${timestamp}.zip`, (err) => {
                        if (err) {
                            console.error(`Download error: ${err}`);
                            return res.status(500).json({
                                success: false,
                                message: 'Error downloading CSV backup',
                                error: err.message
                            });
                        }

                        // Clean up files after sending
                        setTimeout(() => {
                            try {
                                fs.unlinkSync(zipFilePath);
                                fs.rmSync(csvDir, { recursive: true, force: true });
                            } catch (cleanupErr) {
                                console.error(`Cleanup error: ${cleanupErr}`);
                            }
                        }, 60000);
                    });
                });

                archive.on('error', (err) => {
                    throw err;
                });

                // Pipe archive to the output stream
                archive.pipe(output);

                // Add files from directory
                archive.directory(csvDir, false);

                // Finalize archive
                archive.finalize();

                return; // Exit here since we're handling response in event callbacks
            } catch (archiverErr) {
                console.error('Error using archiver:', archiverErr);

                // Fallback: Create and send a combined CSV file
                const combinedCsvPath = path.join(backupDir, `${backupFilename}-combined.csv`);
                let combinedContent = '';

                // Combine all CSVs into one file
                for (const [modelName, data] of Object.entries(collectionsData)) {
                    if (data.length > 0) {
                        if (combinedContent) combinedContent += '\n\n';

                        combinedContent += `# ${modelName}\n`;

                        // Get headers
                        const headers = Object.keys(data[0]);
                        combinedContent += headers.join(',') + '\n';

                        // Add data rows
                        data.forEach(item => {
                            const values = headers.map(header => {
                                const value = item[header];
                                if (value === null || value === undefined) return '';
                                if (typeof value === 'object') {
                                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                                }
                                return `"${String(value).replace(/"/g, '""')}"`;
                            });
                            combinedContent += values.join(',') + '\n';
                        });
                    }
                }

                fs.writeFileSync(combinedCsvPath, combinedContent);

                return res.download(combinedCsvPath, `database-backup-combined-${timestamp}.csv`, (err) => {
                    if (err) {
                        console.error(`Download error: ${err}`);
                        return res.status(500).json({
                            success: false,
                            message: 'Error downloading CSV backup',
                            error: err.message
                        });
                    }

                    // Clean up
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(combinedCsvPath);
                            fs.rmSync(csvDir, { recursive: true, force: true });
                        } catch (cleanupErr) {
                            console.error(`Cleanup error: ${cleanupErr}`);
                        }
                    }, 60000);
                });
            }
        }
        else if (format === 'bson') {
            // Since mongodump isn't available, create a JSON file with BSON extension
            console.log('Creating BSON-format backup (JSON data)');

            // Save each collection to its own file
            const bsonDir = path.join(backupDir, `${backupFilename}-bson`);
            fs.mkdirSync(bsonDir, { recursive: true });

            // Write each collection to a separate file
            for (const [modelName, data] of Object.entries(collectionsData)) {
                const collectionPath = path.join(bsonDir, `${modelName}.json`);
                fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
            }

            // Create a metadata file
            const metadataPath = path.join(bsonDir, 'metadata.json');
            fs.writeFileSync(metadataPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                database: mongoose.connection.db.databaseName,
                collections: Object.keys(collectionsData),
                counts: Object.entries(collectionsData).reduce((acc, [name, data]) => {
                    acc[name] = data.length;
                    return acc;
                }, {})
            }, null, 2));

            // Create a zip archive with all the files (using archiver instead of JSZip)
            try {
                const archiver = require('archiver');
                const zipPath = path.join(backupDir, `${backupFilename}-bson.zip`);
                const output = fs.createWriteStream(zipPath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Maximum compression
                });

                // Listen for archive events
                output.on('close', () => {
                    console.log(`BSON Archive created: ${archive.pointer()} bytes`);

                    // Send the zip file
                    res.download(zipPath, `database-backup-bson-${timestamp}.zip`, (err) => {
                        if (err) {
                            console.error(`Download error: ${err}`);
                            return res.status(500).json({
                                success: false,
                                message: 'Error downloading BSON backup',
                                error: err.message
                            });
                        }

                        // Clean up after sending
                        setTimeout(() => {
                            try {
                                fs.unlinkSync(zipPath);
                                fs.rmSync(bsonDir, { recursive: true, force: true });
                            } catch (cleanupErr) {
                                console.error(`Cleanup error: ${cleanupErr}`);
                            }
                        }, 60000);
                    });
                });

                archive.on('error', (err) => {
                    console.error('Archive error:', err);
                    throw err;
                });

                // Pipe archive data to the output file
                archive.pipe(output);

                // Add all files from the BSON directory to the archive
                archive.directory(bsonDir, false);

                // Finalize the archive
                archive.finalize();

                return; // Exit here since we're handling the response in the event callbacks
            } catch (archiverErr) {
                console.error('Error using archiver for BSON backup:', archiverErr);

                // Fallback to sending individual files as a single JSON
                return createJsonBackupAlternative();
            }
        }

        // Helper function to create JSON backup as alternative
        async function createJsonBackupAlternative() {
            console.log('Falling back to JSON backup format');

            const jsonFilePath = path.join(backupDir, `${backupFilename}.json`);
            fs.writeFileSync(jsonFilePath, JSON.stringify(collectionsData, null, 2));

            res.download(jsonFilePath, `database-backup-${timestamp}.json`, (err) => {
                if (err) {
                    console.error(`Download error: ${err}`);
                    return res.status(500).json({
                        success: false,
                        message: 'Error downloading backup',
                        error: err.message
                    });
                }

                // Clean up
                setTimeout(() => {
                    try {
                        fs.unlinkSync(jsonFilePath);
                    } catch (cleanupErr) {
                        console.error(`Cleanup error: ${cleanupErr}`);
                    }
                }, 60000);
            });
        }

    } catch (error) {
        console.error('Error creating database backup:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating database backup',
            error: error.message
        });
    }
});

module.exports = router;
