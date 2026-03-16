exports.uploadResource = (req, res) => {

    try {

    if (!req.file) {
    return res.status(400).json({
        success: false,
        message: "File tidak ditemukan"
    });
    }

    const relativePath =
    req.file.path.replace("uploads/", "");

    res.json({
    success: true,
    file_name: req.file.filename,
    path: relativePath
    });

    } catch (err) {

    res.status(500).json({
    success: false,
    message: err.message
    });

    }

};