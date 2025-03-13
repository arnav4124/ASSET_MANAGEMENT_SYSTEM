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





