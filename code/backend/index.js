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
const userRouter = require("./routes/userRoute.js");

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

app.use(cors({ origin: process.env.FRONTEND, credentials: true }));
app.use(bodyParser.json());
app.use('/api/user', userRouter);

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

<<<<<<< HEAD
<<<<<<< HEAD
const User = require("./models/user");
const Location = require("./models/location"); // Location model is exported as Itemmodel, not Location
const Programme = require("./models/programme");

// Import routes
const programmeRoutes = require("./routes/programme");

// Use routes
app.use("/api/programmes", programmeRoutes);

// Programme routes
app.post("/api/programmes", async (req, res) => {
    try {
        const { name, programme_type, programmes_description } = req.body;

        const programme = new Programme({
            name,
            programme_type,
            programmes_description
        });

        await programme.save();
        res.status(201).json({ message: "Programme created successfully", programme });
    } catch (error) {
        res.status(500).json({ message: "Error creating programme", error: error.message });
    }
});
=======

>>>>>>> 1951af4a49691e2affa857f2e0d117f819a504c0
=======
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

>>>>>>> a48b6283612b003b7b446b38a9d4d977921e87bf

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
      Invoice_id, // could be empty
      Issued_by,  // must be a valid user _id
      Issued_to,
    } = req.body;

    const assignmentStatusBoolean = assignment_status === "true";
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
      assignment_status: assignmentStatusBoolean,
      Sticker_seq,
      Img: imgBuffer,
      description,
    });

    newAsset.Issued_by = Issued_by;

    // Only set Invoice_id if it contains a valid id
    if (Invoice_id) {
      newAsset.Invoice_id = Invoice_id;
    }

    // Only set Issued_by if it’s a valid user _id
    // if (Issued_by && Issued_by.length === 24) {
    //   newAsset.Issued_by = Issued_by;
    // }

    // Same for Issued_to if you’re using it
    if (Issued_to && Issued_to.length === 24) {
      newAsset.Issued_to = Issued_to;
    }

    await newAsset.save();
    return res.status(201).json({ success: true, asset: newAsset });
  } catch (error) {
    console.error("Error saving asset:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET all assets
app.get("/api/assets", async (req, res) => {
  try {
    const assets = await Asset.find({});
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET asset by id
app.get("/api/assets/:id", async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// app use port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


