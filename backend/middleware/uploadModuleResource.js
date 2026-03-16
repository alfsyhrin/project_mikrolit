const multer = require("multer");
const path = require("path");
const fs = require("fs");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const base = path.join(__dirname, "..", "uploads", "module_resources");
    const ext = path.extname(file.originalname).toLowerCase();

    let sub = "others";
    if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) sub = "images";
    else if (ext === ".pdf") sub = "documents"; // sesuaikan dengan folder nyata
    else if ([".ppt", ".pptx"].includes(ext)) sub = "ppt";

    const uploadPath = path.join(base, sub);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, "_");
    const uniqueName = Date.now() + "-" + safeName;
    cb(null, uniqueName);
  }
});

module.exports = multer({ storage });