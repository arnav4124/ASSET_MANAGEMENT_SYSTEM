require("dotenv").config(); // this loads .env file if you need any env variables

const bcrypt = require("bcryptjs");

const plainPassword = "Admin123"; // change this to your desired password

const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
  } else {
    console.log("Hashed password:", hash);
  }
});
