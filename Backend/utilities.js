const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        
        // No token, unauthorized
        if(!token) return res.status(401).json({ message: "Authentication token required" });
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(403).json({ message: "Invalid or expired token" });
            req.user = user;
            next();
        });
    } catch (err) {
        return res.status(500).json({ message: "Authentication error" });
    }
}

module.exports = authenticateToken