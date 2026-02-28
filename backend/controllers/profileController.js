const UserModel = require("../models/UserModel");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

exports.getProfile = (req, res) => {
    const userId = req.user.id;

    UserModel.findById(userId, (err, results) => {
        if (err) {
            console.log("❌ Error mengambil profile:", err);
            return res.status(500).json({ message: "Server error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const user = results[0];
        const BASE = process.env.BACKEND_URL || "https://erica-slatier-neoma.ngrok-free.dev";

        console.log("✅ Profile found, photo:", user.photo);

        const hasPassword = !!user.password;

        // Jika file ada, sertakan dua opsi: `photo` (URL) dan `photoData` (data URI base64).
        // `photoData` berguna sebagai fallback saat CDN/ngrok/proxy memodifikasi header sehingga browser memblokir request.
        if (user.photo) {
            const filePath = path.join(__dirname, "../uploads", user.photo);
            fs.readFile(filePath, (err, fileBuffer) => {
                if (err) {
                    console.warn("⚠️ Tidak dapat membaca file foto, kirimkan URL saja:", err.message);
                    return res.json({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        nidn: user.nidn,
                        photo: `${BASE}/uploads/${user.photo}`,
                        photoData: null,
                        hasPassword
                    });
                }

                const ext = path.extname(user.photo).toLowerCase();
                let mime = "image/png";
                if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
                else if (ext === ".gif") mime = "image/gif";
                else if (ext === ".webp") mime = "image/webp";

                const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;

                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    nidn: user.nidn,
                    photo: `${BASE}/uploads/${user.photo}`,
                    photoData: dataUri,
                    hasPassword
                });
            });
        } else {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                nidn: user.nidn,
                photo: null,
                photoData: null,
                hasPassword
            });
        }
    });
};

exports.upProfile = (req, res) => {
    const userId = req.user.id;
    const { name, email, nidn } = req.body;

    if (!name || !email || !nidn) {
        return res.status(400).json({ message: "Name, email, dan NIDN harus diisi" });
    }

    UserModel.findByEmail(email, (err, emailResults) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (emailResults.length > 0 && emailResults[0].id !== userId) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }

        UserModel.findById(userId, (err, userResults) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            let photo = null;
            if (req.file) {
                photo = req.file.filename;
                console.log("✅ New photo uploaded:", photo);
            } else {
                photo = userResults[0].photo || null;
                console.log("⚠️ No new photo, keeping old:", photo);
            }

            UserModel.updateProfile(userId, { name, email, nidn, photo }, (err, results) => {
                if (err) {
                    console.log("❌ Error update profile:", err);
                    return res.status(500).json({ message: "Server error" });
                }
                
                res.json({ message: "Profile berhasil diperbarui" });
            });
        });
    });
};

exports.upPassword = (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password dan new password harus diisi" });
    }

    UserModel.findById(userId, async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const user = results[0];

        try {
            let match = false;

            // Jika password tersimpan dalam format bcrypt (mulai dengan $2), gunakan bcrypt.compare.
            if (user.password && typeof user.password === "string" && user.password.startsWith("$2")) {
                match = await bcrypt.compare(currentPassword, user.password);
            } else {
                // Fallback: jika masih plaintext di DB (sangat tidak direkomendasikan), lakukan perbandingan langsung.
                match = (user.password === currentPassword);
            }

            if (!match) {
                return res.status(400).json({ message: "Current password salah" });
            }

            const saltRounds = 10;
            const hashed = await bcrypt.hash(newPassword, saltRounds);

            UserModel.updatePassword(userId, hashed, (errUpdate, updateResult) => {
                if (errUpdate) {
                    console.log("❌ Error update password:", errUpdate);
                    return res.status(500).json({ message: "Server error" });
                }
                res.json({ message: "Password berhasil diperbarui" });
            });
        } catch (e) {
            console.error("❌ upPassword error:", e);
            res.status(500).json({ message: "Server error" });
        }
    });  
};

exports.deletePhoto = (req, res) => {
    const userId = req.user.id;

    UserModel.findById(userId, (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!results || results.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const user = results[0];
        if (!user.photo) return res.status(400).json({ message: "Tidak ada foto untuk dihapus" });

        const filePath = path.join(__dirname, "../uploads", user.photo);
        fs.unlink(filePath, (fsErr) => {
            // tetap update DB meskipun unlink gagal (tapi log)
            if (fsErr) console.warn("Gagal hapus file foto:", fsErr.message);

            UserModel.updatePhoto(userId, null, (updateErr) => {
                if (updateErr) {
                    console.error("Gagal update DB saat hapus foto:", updateErr);
                    return res.status(500).json({ message: "Server error" });
                }
                return res.json({ message: "Foto profil berhasil dihapus" });
            });
        });
    });
};
