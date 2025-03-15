const express = require('express')
const admin_router = express.Router()
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const crypto = require('crypto')
admin_router.get('/get_manager',async(req,res)=>{
    console.log("MANAGER CHECK")
    try{
        const manager = await User.find({role:"User"})
        console.log(manager)
        email_list = []
        res.status(200).json(manager)
        // res.status(200).json(email_list)
    }catch(err){
        console.error("Error fetching manager:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching manager",
            error: error.message
        });
    }
})

admin_router.post('/add_user',async(req,res)=>{
    console.log("ADD USER")
    const {first_name,last_name,email,location} = req.body
    console.log(req.body)
    password = crypto.randomBytes(6).toString('hex');
    role="User"
    try{
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
            location,
            role
        })
        await newUser.save()
        res.status(201).json({ success: true, user: newUser });
    }catch(err){
        console.error("Error saving user:", err);
        res.status(500).json({
            success: false,
            message: "Error saving user",
            error: err.message
        });
    }
})
module.exports = admin_router

