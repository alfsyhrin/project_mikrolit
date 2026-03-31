const path = require("path");

exports.uploadResource = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File tidak ditemukan"
            });
        }

        const relativePath = req.file.path
            .split(path.sep)
            .slice(-3)
            .join("/");

        return res.json({
            success: true,
            file_name: req.file.filename,
            original_name: req.file.originalname,
            display_name: req.file.displayName || req.file.originalname,
            path: relativePath,
            type: req.file.resourceType || "file"
        });

    } catch (err) {
        console.error("[uploadResource] Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};