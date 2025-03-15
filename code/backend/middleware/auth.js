const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const { token } = req.headers;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access: No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Store the decoded user data in req.user
        req.user = decoded.user;
        next();
    } catch (error) {
        console.log("Auth error:", error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access: Invalid token'
        });
    }
}

module.exports = authMiddleware;
