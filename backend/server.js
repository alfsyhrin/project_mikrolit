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
const notificationRoute = require("./routes/notificationRoute");
const studentLearningRoute = require("./routes/studentLearningRoute");
const discussionRoute = require("./routes/discussionRoute");
const socketHandler = require("./socket/socketHandler");
const monitoringRoute = require("./routes/moduleMonitoringRoute");
const forgotPasswordRoute = require("./routes/forgotPasswordRoute");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO Handler
require('./socket/socketHandler')(io);
require('./listeners/notificationListener');

// Middleware untuk CORS + CORP pada static files di /uploads
app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    fallthrough: false,
    index: false,
    maxAge: "1d"
}));

// Middleware
app.use(express.static('public'));

// Handler khusus jika file tidak ditemukan di /uploads
app.use("/uploads", (req, res) => {
    res.status(404).json({ message: "File not found" });
});

app.use((req, res, next) => {
    console.log("MASUK KE BACKEND:", req.method, req.url);
    next();
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
app.use("/api/notifications", notificationRoute);
app.use("/api/student", studentLearningRoute);
app.use("/api/discussion", discussionRoute);
app.use("/api/monitoring", monitoringRoute);
app.use("/api/forgot-password", forgotPasswordRoute);
app.use((err, req, res, next) => {
    console.error("❌ ERROR TERJADI:");
    console.error(err.stack);

    res.status(500).json({
        message: "Internal Server Error",
        error: err.message
    });
});

app.get("/", (req, res) => {
    res.send("Server berjalan dengan baik!");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log("Backend berjalan di http://localhost:" + PORT);
});

app.use((err, req, res, next) => {
    console.error("❌ GLOBAL ERROR:");
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});