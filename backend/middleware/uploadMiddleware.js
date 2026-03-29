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
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "file";
}

function storageFor(subfolder) {
  const uploadPath = path.join(__dirname, "..", "uploads", subfolder);
  ensureDir(uploadPath);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const cleanBase = sanitizeBaseName(file.originalname);
      const uniqueSuffix = crypto.randomUUID().slice(0, 8);

      file.displayName = `${cleanBase}${ext}`;
      file.cleanBaseName = cleanBase;

      cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
    }
  });
}

function fileFilterFactory(allowedExt = []) {
  return (req, file, cb) => {
    if (allowedExt.length === 0) return cb(null, true);
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.includes(ext)) cb(null, true);
    else cb(new Error("File type not allowed: " + ext));
  };
}

module.exports = {
  profile: multer({
    storage: storageFor("/"),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilterFactory([".png", ".jpg", ".jpeg"])
  }),
  tasks: multer({
    storage: storageFor("tasks"),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilterFactory([
      ".pdf", ".doc", ".docx",
      ".ppt", ".pptx",
      ".zip",
      ".png", ".jpg", ".jpeg"
    ])
  }),
  modules: multer({
    storage: storageFor("modules"),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: fileFilterFactory([".pdf", ".doc", ".docx", ".mp4", ".mp3", ".png", ".jpg", ".jpeg"])
  }),
  for: (subfolder, opts = {}) => multer({
    storage: storageFor(subfolder),
    limits: opts.limits || { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilterFactory(opts.allowedExt || [])
  })
};