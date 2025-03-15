const userModel = require("../models/user");
const jwt = require("jsonwebtoken");

//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        } else {
            if (password !== user.password) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            } else {
                const token = createToken(user._id);
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

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

module.exports = { loginUser };
