const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const axios = require("axios");


//login user
const loginUser = async (req, res) => {
    const recapchaToken=req.body.recaptchaToken;
		if(!recapchaToken){
			return res.status(400).send({ message: "Recaptcha Token is required" });
		}

        const isRecaptchValid = await verifyRecaptcha(recapchaToken);
		if(!isRecaptchValid){
			return res.status(400).send({ message: "Invalid Recaptcha Token" });
		}

    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        } else {
            if (password !== user.password) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            } else {
                const token = createToken(user);
                const userData = {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    location: user.location,
                    role: user.role
                };

                res.json({
                    success: true,
                    token,
                    user: userData
                });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

const verifyRecaptcha = async (recaptchaToken) => {
    const secretKey = "6Lc52PYqAAAAAM-nybw2l65DO3JQyDMSTFXoBurk"; // Replace with your reCAPTCHA secret key
    const url = "https://www.google.com/recaptcha/api/siteverify";

    try {
        const response = await axios.post(url, null, {
            params: {
                secret: secretKey,
                response: recaptchaToken,
            },
        });

        return response.data.success; // Returns true if reCAPTCHA is valid
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        return false;
    }
};
const createToken = (user) => {
    return jwt.sign({
        id: user._id,
        user: {
            id: user._id,
            location: user.location,
            role: user.role
        }
    }, process.env.JWT_SECRET);
}

module.exports = { loginUser };
