const userModel = require("../models/UserModel");

exports.getUsers = (req, res) => {
    // req.user sudah diisi oleh authMiddleware
    if (req.user.role !== "dosen") {
        return res.status(403).json({ message: "Akses ditolak. Hanya dosen yang dapat mengakses data pengguna." });
    }

    userModel.findByRole("mahasiswa", (err, results) => {
        if (err) {
            console.log("Error saat mengambil data pengguna", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.status(200).json(results);
    });
}

exports.updateUsers = (req, res) => {
    if (req.user.role !== "dosen") {
        return res.status(403).json({ message: "Akses ditolak. Hanya dosen yang dapat memperbarui status pengguna." });
    }

    const { id } = req.params;
    let { status } = req.body;

    const statusMap = {
        diterima: "diterima",
        ditolak: "ditolak",
        approved: "diterima",
        rejected: "ditolak",
        pending: "pending"
    }

    status = statusMap[status] || status;

    const validStatus = ["diterima", "ditolak", "pending"];
    if (!validStatus.includes(status)) {
        return res.status(400).json({ message: "Status tidak valid. Harus 'diterima', 'ditolak', atau 'pending'." });
    }
    
    userModel.findById(id, (err, results) => {
        if (err) {
            console.log("Error saat mencari pengguna", err);
            return res.status(500).json({ message: "Server error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }

        userModel.updateStatus(id, status, (err, updateResult) => {
            if (err) {
                console.log("Error saat memperbarui status pengguna", err);
                return res.status(500).json({ message: "Server error" });
            }
            res.status(200).json({ 
                message: "Status pengguna berhasil diperbarui", 
                data: { id, status } 
            });
        });
    });
}