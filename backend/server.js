require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const authRoute = require("./routes/authRoute");
const registRoute = require("./routes/registRoute");
const userRoute = require("./routes/userRoute");
const profileRoute = require("./routes/profileRoute");
const moduleRoute = require("./routes/moduleRoute");
const microUnitsRoute = require("./routes/microUnitsRoute");
const writingRoute = require("./routes/writingRoute");
const reflectRoute = require("./routes/reflectRoute");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk CORS + CORP pada static files di /uploads
app.use("/uploads", (req, res, next) => {
    // Izinkan akses lintas-origin untuk resource statis (gambar)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    // Izinkan resource di-embed lintas origin
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    // Jangan set COOP/COEP di sini — ini dapat mengakibatkan resource cross-origin diblokir
    // Debug kecil untuk melihat path yang diminta
    console.log(`[uploads] request: ${req.method} ${req.path}`);
    next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(express.static('public'));

// Handler khusus jika file tidak ditemukan di /uploads
app.use("/uploads", (req, res) => {
    res.status(404).json({ message: "File not found" });
});

// ROUTES
app.use("/api", authRoute);
app.use("/api", registRoute);
app.use("/api", userRoute);
app.use("/api", profileRoute);
app.use("/api", moduleRoute);
app.use("/api", microUnitsRoute);
// Mount writing routes under /api/writing so endpoints are predictable
app.use("/api/writing", writingRoute);
app.use("/api", reflectRoute);

// Socket.IO Handler
require('./socket/socketHandler')(io);

app.get("/", (req, res) => {
    res.send("Server berjalan dengan baik!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Backend berjalan di http://localhost:" + PORT);
});


