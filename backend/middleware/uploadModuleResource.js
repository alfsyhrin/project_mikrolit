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

  return (
    base
      .normalize("NFKD")
      .replace(/[^\w\s.-]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "") || "resource"
  );
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

function getResourceTypeByExt(ext = "") {
  const lowerExt = ext.toLowerCase();

  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(lowerExt)) {
    return "image";
  }

  if ([".ppt", ".pptx"].includes(lowerExt)) {
    return "ppt";
  }

  if ([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"].includes(lowerExt)) {
    return "document";
  }

  return "file";
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const base = path.join(__dirname, "..", "uploads", "module_resources");
    const ext = path.extname(file.originalname).toLowerCase();
    const sub = getTargetSubfolder(ext);

    const uploadPath = path.join(base, sub);
    ensureDir(uploadPath);

    file.targetSubfolder = sub;
    file.resourceType = getResourceTypeByExt(ext);

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = sanitizeBaseName(file.originalname);
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);

    file.displayName = `${cleanBase}${ext}`;
    file.cleanBaseName = cleanBase;

    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

module.exports = multer({ storage });