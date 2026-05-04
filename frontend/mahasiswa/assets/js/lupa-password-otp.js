// ============================================
// LUPA PASSWORD - TAHAP 2: Verify OTP
// ============================================

import { verifyOTPRequest } from "../../../assets/api.js";
import Toast from "../../../assets/toast.js";

document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll(".otp-input");
    const submitBtn = document.querySelector(".btn");
    // const loginMessage = document.getElementById("loginMessage");

    // === AMBIL EMAIL DARI LOCALSTORAGE ===
    const email = localStorage.getItem("fpEmail");

    if (!email) {
        Toast.error("Email tidak ditemukan. Kembali ke halaman pertama!", "error");
        setTimeout(() => {
            window.location.href = "./lupa-password-email.html";
        }, 1500);
        return;
    }

    // ============ INPUT OTP AUTO-FOCUS (SUDAH ADA) ============
    // Kode ini sudah ada di HTML file, tapi perlu tambahan:

    // ============ SUBMIT OTP ============
    submitBtn.addEventListener("click", async function (e) {
        e.preventDefault();

        // === AMBIL NILAI OTP DARI 6 INPUT ===
        let otp = "";
        inputs.forEach(input => {
            otp += input.value;
        });

        // === VALIDASI OTP ===
        if (otp.length !== 6) {
            Toast.warning("OTP harus 6 digit!", "error");
            return;
        }

        if (isNaN(otp)) {
            Toast.warning("OTP harus berupa angka!", "error");
            return;
        }

        // === DISABLE BUTTON & SHOW LOADING ===
        submitBtn.disabled = true;
        submitBtn.textContent = "Memverifikasi...";
        // loginMessage.textContent = "";

        try {
            // === CALL API: VERIFY OTP ===
            const response = await verifyOTPRequest(email, otp);

            if (response.success) {
                // === SIMPAN TOKEN KE LOCALSTORAGE ===
                localStorage.setItem("fpToken", response.data.token);
                // Email sudah disimpan di tahap 1

                Toast.success("OTP valid! Lanjut ke reset password...", "success");

                // === REDIRECT KE TAHAP 3 (reset password) ===
                setTimeout(() => {
                    window.location.href = "./lupa-password-sandibaru.html";
                }, 1500);
            } else {
                // === ERROR RESPONSE ===
                Toast.error(response.message || "OTP tidak valid", "error");
                // loginMessage.textContent = response.message || "OTP tidak valid";

                // === CLEAR OTP INPUTS ===
                inputs.forEach(input => {
                    input.value = "";
                });
                inputs[0].focus();
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

    // === ALLOW ENTER KEY ===
    inputs[inputs.length - 1].addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            submitBtn.click();
        }
    });
});