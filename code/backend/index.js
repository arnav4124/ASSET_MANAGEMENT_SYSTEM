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

// require("dotenv").config();
require("dotenv").config({ path: ".env" });
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

app.use(cors());
app.use(bodyParser.json());


mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log(err));



