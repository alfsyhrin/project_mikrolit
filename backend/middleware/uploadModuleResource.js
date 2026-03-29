const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sanitizeBaseName(filename = "") {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  return base
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")   // buang karakter aneh
    .replace(/\s+/g, "_")        // spasi jadi underscore
    .replace(/_+/g, "_")         // rapikan underscore ganda
    .replace(/^_+|_+$/g, "")     // trim underscore depan/belakang
    || "resource";
}

function getTargetSubfolder(ext = "") {
  const lowerExt = ext.toLowerCase();

  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(lowerExt)) {
    return "images";
  }

  if ([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"].includes(lowerExt)) {
    return "documents";
  }

  if ([".ppt", ".pptx"].includes(lowerExt)) {
    return "ppt";
  }

  return "others";
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const base = path.join(__dirname, "..", "uploads", "module_resources");
    const ext = path.extname(file.originalname).toLowerCase();
    const sub = getTargetSubfolder(ext);

    const uploadPath = path.join(base, sub);
    ensureDir(uploadPath);

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = sanitizeBaseName(file.originalname);
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);

    // dipakai controller nanti
    file.displayName = `${cleanBase}${ext}`;
    file.cleanBaseName = cleanBase;

    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

module.exports = multer({ storage });