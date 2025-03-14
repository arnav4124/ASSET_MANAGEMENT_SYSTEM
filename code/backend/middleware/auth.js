const jwt = require("jsonwebtoken");    

function authMiddleware(req, res, next){
<<<<<<< HEAD
    // const {token}=req.headers;
    // if(!token){
    //     return res.json({success:false,message:'Unauthorized access'});
    // }
=======
    console.log("BURHUHU")
    const {token}=req.headers;
    if(!token){
        console.log("TOKEN NHI H    ")
        return res.json({success:false,message:'Unauthorized access'});
    }
>>>>>>> 71b4c1b6f8ed5f9391df31bb813fd21077737e17

    // try {
    //     const tokendecode=jwt.verify(token,process.env.JWT_SECRET);
    //     req.body.userId=tokendecode.id;
    //     next();
    // } catch (error) {
    //     console.log(error);
    //     return res.json({success:false,message:'Unauthorized access'});
    // }
    next();
}

module.exports = authMiddleware;