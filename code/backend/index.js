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
const programmeRoutes = require("./routes/programme.js");
const projectRoutes = require("./routes/project.js");
const adminRoutes = require("./routes/admin.js");
const locationRoutes = require("./routes/location");
const superuserRoutes = require("./routes/superuser.js");
const categoryRoutes = require("./routes/category.js");
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
const assetRouter = require("./routes/assetRoute");

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'user']
}));
app.use(bodyParser.json());



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
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/superuser", superuserRoutes);
app.use("/api/assets", assetRouter);
app.use("/api/categories", categoryRoutes);
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



// app.post("/add-asset", upload.single("Img"), async (req, res) => {
//   try {
//     const {
//       name,
//       Serial_number,
//       asset_type,
//       status,
//       Office,
//       assignment_status,
//       Sticker_seq,
//       description,
//       Invoice_id, // could be empty
//       Issued_by,  // must be a valid user _id
//       Issued_to,
//     } = req.body;

//     const assignmentStatusBoolean = assignment_status === "true";
//     let imgBuffer = null;
//     if (req.file) {
//       imgBuffer = req.file.buffer;
//     }

//     const newAsset = new Asset({
//       name,
//       Serial_number,
//       asset_type,
//       status,
//       Office,
//       assignment_status: assignmentStatusBoolean,
//       Sticker_seq,
//       Img: imgBuffer,
//       description,
//     });

//     newAsset.Issued_by = Issued_by;

//     // Only set Invoice_id if it contains a valid id
//     if (Invoice_id) {
//       newAsset.Invoice_id = Invoice_id;
//     }

//     // Only set Issued_by if it's a valid user _id
//     // if (Issued_by && Issued_by.length === 24) {
//     //   newAsset.Issued_by = Issued_by;
//     // }

//     // Same for Issued_to if you're using it
//     if (Issued_to && Issued_to.length === 24) {
//       newAsset.Issued_to = Issued_to;
//     }

//     await newAsset.save();
//     return res.status(201).json({ success: true, asset: newAsset });
//   } catch (error) {
//     console.error("Error saving asset:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });

// // GET all assets
// app.get("/api/assets", async (req, res) => {
//   try {
//     const assets = await Asset.find({});
//     res.json(assets);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // GET asset by id
// app.get("/api/assets/:id", async (req, res) => {
//   try {
//     const asset = await Asset.findById(req.params.id);
//     if (!asset) {
//       return res.status(404).json({ error: "Asset not found" });
//     }
//     res.json(asset);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.get("/api/projects", async (req, res) => {
    try {
        const allProjects = await Project.find({});
        res.json(allProjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/my-profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);

app.put('/update-profile/:id', async (req, res) => {
    try {
        const
        { first_name, last_name, email, location, role } = req.body;
        const
        user
        = await User.findByIdAndUpdate(req.params.id, { first_name, last_name, email, location, role }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);

// app use port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


