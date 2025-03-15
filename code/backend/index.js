const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const xml2js = require("xml2js");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import routes
const userRouter = require("./routes/userRoute.js");
const programmeRoutes = require("./routes/programme");

// require("dotenv").config();
require("dotenv").config({ path: ".env" });
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

// schemas
const User = require("./models/user");
const Location = require("./models/location"); // Location model is exported as Itemmodel, not Location
const Asset = require("./models/asset");
const Programme = require("./models/programme");
const Invoice = require("./models/invoice");
const Project = require("./models/project");

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const assetRouter = require("./routes/assetRoute");
app.use("/api/assets", assetRouter);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Routes
app.use('/api/user', userRouter);
app.use("/api/programmes", programmeRoutes);


// test route
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api/users", async (req, res) => {
    try {
        const allUsers = await User.find({});
        console.log(allUsers);
        res.json(allUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/projects", async (req, res) => {
    try {
        const allProjects = await Project.find({});
        res.json(allProjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// app use port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


