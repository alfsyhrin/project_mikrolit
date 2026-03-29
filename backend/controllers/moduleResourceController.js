const path = require("path");

exports.uploadResource = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File tidak ditemukan"
            });
        }

        // simpan relative path yang konsisten
        const relativePath = req.file.path
            .split(path.sep)
            .slice(-3)
            .join("/");

        return res.json({
            success: true,
            file_name: req.file.filename,                 // nama fisik file di server
            original_name: req.file.originalname,        // nama asli saat upload
            display_name: req.file.displayName || req.file.originalname, // nama bersih untuk UI
            path: relativePath                           // contoh: module_resources/ppt/File-a1b2c3d4.pptx
        });

    } catch (err) {
        console.error("[uploadResource] Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};