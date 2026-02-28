require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoute = require("./routes/authRoute");
const registRoute = require("./routes/registRoute");
const userRoute = require("./routes/userRoute");
const profileRoute = require("./routes/profileRoute");

const app = express();
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

// Handler khusus jika file tidak ditemukan di /uploads
app.use("/uploads", (req, res) => {
    res.status(404).json({ message: "File not found" });
});

// ROUTES
app.use("/api", authRoute);
app.use("/api", registRoute);
app.use("/api", userRoute);
app.use("/api", profileRoute);

app.get("/", (req, res) => {
    res.send("Server berjalan dengan baik!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Backend berjalan di http://localhost:" + PORT);
});


