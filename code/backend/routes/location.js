const express = require('express')
const location_router = express.Router()
const Location = require('../models/location')
const authMiddleware = require('../middleware/auth')   

location_router.get('/get_cities',authMiddleware,async(req,res)=>{
    console.log("CHECKKK")  
    try {
        const locations = await Location.find({parent_location:"ROOT"})
        const response = [
            {
                _id:"ROOT",
                location_name:"ROOT",
                location_type:"ROOT",
            },
            ...locations
        ]
        console.log(response)
        return res.status(200).json(response)
    }
    catch (error) {
        console.error("Error fetching location:", error);
        res.status(500).json({
            message: "Error fetching location",
            error: error.message
        });
    }
})

location_router.post('/add_location',authMiddleware,async(req,res)=>{
    try{    
        const {location_name,location_type,parent_location,address,pincode} = req.body
        console.log(req.body)
        const location = new Location({
            location_name,
            location_type,
            parent_location,
            address,
            pincode
        })
        await location.save()
        console.log(response)
        res.status(200).json({success:true,message:"Location added successfully"})
    }
    catch(err){
        res.status(500).json({success:false,message:"Error in adding location"})
    }
})


location_router.get('/',authMiddleware,async(req,res)=>{
    try {
        const locations = await Location.find({})
        res.status(200).json(locations)
    }
    catch (error) {
        console.error("Error fetching location:", error);
        res.status(500).json({
            message: "Error fetching location",
            error: error.message
        });
    }
}
)


location_router.get('/get_all_cities',authMiddleware,async(req,res)=>{
    try{
        const locations = await Location.find({})
        location_name_list = []
        for(i=0;i<locations.length;i++){
            location_name_list.push(locations[i].location_name)
        }
        console.log(location_name_list)
        res.status(200).json(location_name_list)
    }catch(err){
        res.status(500).json({success:false,message:"Error in fetching locations"})
    }
})

module.exports = location_router
