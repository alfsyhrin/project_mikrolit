// ============================================
// LUPA PASSWORD - TAHAP 3: Reset Password Baru
// ============================================

import { resetPasswordRequest } from "../../../assets/api.js";
import Toast from "../../../assets/toast.js";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const password1Input = document.getElementById("password1");
    const password2Input = document.getElementById("password2");
    const submitBtn = document.querySelector('button[type="submit"]');

    // === AMBIL EMAIL & TOKEN DARI LOCALSTORAGE ===
    const email = localStorage.getItem("fpEmail");
    const token = localStorage.getItem("fpToken");

    if (!email || !token) {
        Toast.error("Session expired. Kembali ke halaman pertama!", "error");
        setTimeout(() => {
            window.location.href = "./lupa-password-email.html";
        }, 1500);
        return;
    }

    // ============ TOGGLE PASSWORD VISIBILITY ============
    // ✅ FIX: Cari semua element dengan class "toggle-password"
    // document.querySelectorAll('.toggle-password').forEach(toggle => {
    //     toggle.addEventListener('click', function () {
    //         // Ambil target dari data-target attribute
    //         const targetId = this.dataset.target;
    //         const targetInput = document.getElementById(targetId);

    //         // Toggle antara password dan text
    //         const type = targetInput.type === 'password' ? 'text' : 'password';
    //         targetInput.type = type;

    //         // Ganti icon
    //         this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    //     });
    // });

    // ============ SUBMIT FORM RESET PASSWORD ============
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const password = password1Input.value.trim();
        const confirmPassword = password2Input.value.trim();

        // === VALIDASI INPUT ===
        if (!password) {
            Toast.warning("Password baru tidak boleh kosong!", "error");
            return;
        }

        if (!confirmPassword) {
            Toast.warning("Konfirmasi password tidak boleh kosong!", "error");
            return;
        }

        // === VALIDASI PASSWORD MINIMAL 8 KARAKTER ===
        if (password.length < 8) {
            Toast.warning("Password minimal 8 karakter!", "error");
            return;
        }

        // === VALIDASI PASSWORD SAMA ===
        if (password !== confirmPassword) {
            Toast.warning("Password dan konfirmasi password tidak cocok!", "error");
            return;
        }

        // === DISABLE BUTTON & SHOW LOADING ===
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengubah Password...";

        try {
            // === CALL API: RESET PASSWORD ===
            const response = await resetPasswordRequest(email, token, password, confirmPassword);

            if (response.success) {
                Toast.success("Password berhasil direset! Silakan login...", "success");

                // === CLEAR LOCALSTORAGE ===
                localStorage.removeItem("fpEmail");
                localStorage.removeItem("fpToken");

                // === REDIRECT KE LOGIN ===
                setTimeout(() => {
                    window.location.href = "../../../index.html";
                }, 2000);
            } else {
                // === ERROR RESPONSE ===
                Toast.error(response.message || "Gagal reset password", "error");
            }
        } catch (error) {
            console.error("Error:", error);
            Toast.error("Terjadi kesalahan: " + error.message, "error");
        } finally {
            // === ENABLE BUTTON LAGI ===
            submitBtn.disabled = false;
            submitBtn.textContent = "Ubah Password";
        }
    });
});