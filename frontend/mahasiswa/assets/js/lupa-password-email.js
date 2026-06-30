// ============================================
// LUPA PASSWORD - TAHAP 1: Request OTP via Email
// ============================================

import { requestPasswordResetRequest } from "../../../assets/api.js";
import Toast from "../../../assets/toast.js";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const confirmEmailInput = document.getElementById("password"); // Input kedua (seharusnya buat label baru)
    const submitBtn = document.querySelector('button[type="submit"]');
    // const loginMessage = document.getElementById("loginMessage");

    // ============ SUBMIT FORM ============
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const confirmEmail = confirmEmailInput.value.trim();

        // === VALIDASI INPUT ===
        if (!email) {
            Toast.warning("Email tidak boleh kosong!", "error");
            return;
        }

        if (!confirmEmail) {
            Toast.warning("Konfirmasi email tidak boleh kosong!", "error");
            return;
        }

        // === VALIDASI FORMAT EMAIL ===
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Toast.warning("Format email tidak valid!", "error");
            return;
        }

        // === VALIDASI EMAIL SAMA ===
        if (email !== confirmEmail) {
            Toast.warning("Email dan konfirmasi email tidak cocok!", "error");
            return;
        }

        // === DISABLE BUTTON & SHOW LOADING ===
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";
        // loginMessage.textContent = "";

        try {
            // === CALL API: REQUEST OTP ===
            const response = await requestPasswordResetRequest(email);

            if (response.success) {
                // === SIMPAN EMAIL KE LOCALSTORAGE ===
                localStorage.setItem("fpEmail", email);

                Toast.success("OTP telah dikirim ke email Anda!", "success");

                // === REDIRECT KE TAHAP 2 (verifikasi OTP) ===
                setTimeout(() => {
                    window.location.href = "./lupa-password-otp.html";
                }, 1500);
            } else {
                // === ERROR RESPONSE ===
                Toast.error(response.message || "Gagal mengirim OTP", "error");
                // loginMessage.textContent = response.message || "Gagal mengirim OTP";
            }
        } catch (error) {
            console.error("Error:", error);
            Toast.error("Terjadi kesalahan: " + error.message, "error");
            // loginMessage.textContent = "Terjadi kesalahan: " + error.message;
        } finally {
            // === ENABLE BUTTON LAGI ===
            submitBtn.disabled = false;
            submitBtn.textContent = "Kirim";
        }
    });
});