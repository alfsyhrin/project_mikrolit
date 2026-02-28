const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "your_secret_key", (err, decoded) => {
        if (err) {
            console.log("❌ Token invalid/expired:", err.message);
            return res.status(401).json({ message: "Token tidak valid atau sudah expired" });
        }
        
        console.log("✅ Token valid, user:", decoded);
        req.user = decoded;
        next();
    });
};

module.exports = authMiddleware;