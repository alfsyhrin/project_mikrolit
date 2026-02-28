import { getProfileRequest, updateProfileRequest, updatePasswordRequest, deletePhotoRequest } from "./api.js";

function initPengaturan() {
    const filters = document.querySelectorAll(".filter-pengaturan");
    const containers = document.querySelectorAll(".profile-container, .password-container");

    filters.forEach(filter => {
        filter.addEventListener("click", function () {
            const target = this.getAttribute("data-target");
            if (this.classList.contains("active")) return;

            filters.forEach(f => f.classList.remove("active"));
            this.classList.add("active");

            containers.forEach(c => {
                c.classList.add("hidden");
            });

            setTimeout(() => {
                document.getElementById(target).classList.remove("hidden");
            }, 50);
        });
    });

    // --- Edit Profile ---
    const namaInput = document.getElementById("namaLengkap");
    const emailInput = document.getElementById("email");
    const nidnInput = document.getElementById("nidn");
    const photoInput = document.getElementById("photoInput");
    const photoPreview = document.getElementById("profilePhotoPreview");
    const hapusFotoBtn = document.getElementById("hapusFotoBtn");
    const ubahFotoBtn = document.getElementById("ubahFotoBtn");
    const simpanBtn = document.getElementById("simpanPerubahanBtn");

    let selectedPhotoFile = null;
    const token = localStorage.getItem("token");

    hapusFotoBtn.addEventListener("click", async function () {
        if (!confirm("Apakah Anda yakin ingin menghapus foto profil?")) return;
        try {
            const result = await deletePhotoRequest(token);
            console.log("✅ Delete photo response:", result);
            alert(result.message || "Foto berhasil dihapus");
            await loadProfile();
        } catch (error) {
            console.error("❌ Gagal hapus foto:", error);
            alert("Gagal menghapus foto");
        } finally {
            selectedPhotoFile = null;
            photoInput.value = ""; // Reset file input
        }
    });
    // Load profile saat halaman dibuka
    async function loadProfile() {
        try {
            const data = await getProfileRequest(token);
            console.log("✅ Data dari backend:", data);

            namaInput.value = data.name || "";
            emailInput.value = data.email || "";
            nidnInput.value = data.nidn || "";

            // Pilih sumber foto: gunakan `photoData` (base64) bila tersedia sebagai fallback terhadap ORB
            if (data.photoData) {
                console.log("📷 Setting photo from data URI (fallback)");
                photoPreview.src = data.photoData;
                photoPreview.onload = function() {
                    console.log("✅ Foto (data URI) berhasil dimuat!");
                };
                photoPreview.onerror = function() {
                    console.error("❌ Gagal load foto dataURI, fallback ke URL/ui-avatar");
                    if (data.photo) photoPreview.src = data.photo + "?v=" + Date.now();
                    else photoPreview.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.name || "User");
                };
            } else if (data.photo) {
                const photoUrl = data.photo + "?v=" + Date.now();
                console.log("📷 Setting photo src:", photoUrl);
                photoPreview.src = photoUrl;
                photoPreview.onerror = function() {
                    console.error("❌ Gagal load foto dari:", photoUrl);
                    photoPreview.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.name || "User");
                };
                photoPreview.onload = function() {
                    console.log("✅ Foto berhasil dimuat!");
                };
            } else {
                photoPreview.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.name || "User");
            }

            // Emit event agar komponen lain (mis. navbar di dashboard) dapat update realtime
            try {
                window.dispatchEvent(new CustomEvent("profileUpdated", { detail: data }));
            } catch (e) {
                console.warn("Cannot dispatch profileUpdated event:", e);
            }

            return data;
        } catch (error) {
            console.error("❌ Gagal load profile:", error);
            alert("Gagal memuat profil");
            throw error;
        }
    }

    // Preview foto lokal saat pilih file
    photoInput.addEventListener("change", function () {
        if (this.files && this.files[0]) {
            selectedPhotoFile = this.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                photoPreview.src = e.target.result;
                console.log("📸 Preview foto lokal dimuat");
            };
            reader.readAsDataURL(selectedPhotoFile);
        }
    });

    // Klik tombol "Ubah Foto"
    ubahFotoBtn.addEventListener("click", function () {
        photoInput.click();
    });

    // Klik "Simpan Perubahan"
    simpanBtn.addEventListener("click", async function () {
        const name = namaInput.value.trim();
        const email = emailInput.value.trim();
        const nidn = nidnInput.value.trim();

        if (!name || !email || !nidn) {
            alert("Semua field harus diisi");
            return;
        }

        try {
            simpanBtn.disabled = true;
            const result = await updateProfileRequest(name, email, nidn, selectedPhotoFile, token);
            console.log("✅ Update response:", result);
            
            alert(result.message || "Profile berhasil diperbarui");
            selectedPhotoFile = null;
            photoInput.value = ""; // Reset file input
            await loadProfile();
        } catch (error) {
            console.error("❌ Gagal update profil:", error);
            alert("Gagal update profil: " + error.message);
        } finally {
            simpanBtn.disabled = false;
        }
    });

    // Inisialisasi elemen untuk tab Password
    const passwordLamaInput = document.getElementById("passwordLama");
    const passwordBaruInput = document.getElementById("passwordBaru");
    const konfirmasiPasswordInput = document.getElementById("konfirmasiPassword");
    const ubahPasswordBtn = document.getElementById("ubahPasswordBtn");

    // Handler klik "Ubah Password"
    ubahPasswordBtn.addEventListener("click", async function () {
        const currentPassword = (passwordLamaInput.value || "").trim();
        const newPassword = (passwordBaruInput.value || "").trim();
        const confirm = (konfirmasiPasswordInput.value || "").trim();

        if (!currentPassword || !newPassword || !confirm) {
            alert("Semua field password harus diisi");
            return;
        }

        if (newPassword.length < 6) {
            alert("Password baru minimal 6 karakter");
            return;
        }

        if (newPassword !== confirm) {
            alert("Password baru dan konfirmasi tidak cocok");
            return;
        }

        try {
            ubahPasswordBtn.disabled = true;
            const result = await updatePasswordRequest(currentPassword, newPassword, token);
            console.log("✅ Update password response:", result);

            if (result && (result.message || result.error)) {
                alert(result.message || result.error);
            } else {
                alert("Password berhasil diperbarui");
            }

            // reset form
            passwordLamaInput.value = "";
            passwordBaruInput.value = "";
            konfirmasiPasswordInput.value = "";
        } catch (err) {
            console.error("❌ Gagal update password:", err);
            alert("Gagal mengubah password");
        } finally {
            ubahPasswordBtn.disabled = false;
        }
    });

    // Inisialisasi pertama
    loadProfile();
}

export { initPengaturan };