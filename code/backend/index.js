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

app.use(cors());
app.use(bodyParser.json());


mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// test route
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api/users", async (req, res) => {
    try {
        const allUsers = await User.find({});
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


app.post("/add-asset", upload.single("Img"), async (req, res) => {
    try {
        const {
        name,
        Serial_number,
        asset_type,
        status,
        Office,
        assignment_status,
        Sticker_seq,
        description,
        Invoice_id,
        Issued_by,
        Issued_to,
        } = req.body;
    
        let imgBuffer = null;
        if (req.file) {
        imgBuffer = req.file.buffer;
        }
    
        const newAsset = new Asset({
        name,
        Serial_number,
        asset_type,
        status,
        Office,
        assignment_status: assignment_status === "true",
        Sticker_seq,
        Img: imgBuffer,
        description,
        Invoice_id,
        Issued_by,
        Issued_to,
        });
    
        await newAsset.save();
        res.status(201).json({ success: true, asset: newAsset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
    });

// app use port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


