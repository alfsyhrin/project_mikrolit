const multer = require("multer");
const path = require("path");
const fs = require("fs");

// helper buat folder jika belum ada
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// storage factory
function storageFor(subfolder) {
  const uploadPath = path.join(__dirname, "..", "uploads", subfolder);
  ensureDir(uploadPath);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = (req.user ? req.user.id + "-" : "") + Date.now() + ext;
      cb(null, unique);
    }
  });
}

// fileFilter factory (optional)
function fileFilterFactory(allowedExt = []) {
  return (req, file, cb) => {
    if (allowedExt.length === 0) return cb(null, true);
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.includes(ext)) cb(null, true);
    else cb(new Error("File type not allowed: " + ext));
  };
}

// exported middleware instances
module.exports = {
  profile: multer({
    storage: storageFor("/"),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: fileFilterFactory([".png", ".jpg", ".jpeg"])
  }),
  tasks: multer({
    storage: storageFor("tasks"),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilterFactory([".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"])
  }),
  modules: multer({
    storage: storageFor("modules"),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video/pdf
    fileFilter: fileFilterFactory([".pdf", ".doc", ".docx", ".mp4", ".mp3", ".png", ".jpg", ".jpeg"])
  }),
  // or a factory if you prefer
  for: (subfolder, opts = {}) => multer({
    storage: storageFor(subfolder),
    limits: opts.limits || { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilterFactory(opts.allowedExt || [])
  })
};