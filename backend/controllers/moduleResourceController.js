const path = require("path");

exports.uploadResource = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File tidak ditemukan"
            });
        }

        // ✅ Simpan RELATIVE PATH dengan separator / yang konsisten di semua OS
        const relativePath = req.file.path
            .split(path.sep)           // Split by OS separator (\\ atau /)
            .slice(-3)                 // Ambil 3 bagian: module_resources/category/filename
            .join('/');                // Gabung dengan forward slash

        res.json({
            success: true,
            file_name: req.file.filename,
            path: relativePath         // Contoh: module_resources/documents/1774460251834-file.pdf
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};