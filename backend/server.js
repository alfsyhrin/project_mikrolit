require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoute = require("./routes/authRoute");
const registRoute = require("./routes/registRoute");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api", authRoute);
app.use("/api", registRoute);
app.get("/", (req, res) => {
    res.send("Server berjalan dengan baik!");
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log("Backend berjalan di http://localhost:" + PORT);
});


