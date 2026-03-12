import { registerRequest } from "../../../assets/api.js";
import { Toast } from "../../../assets/toast.js";
const registerForm = document.getElementById("registrasiForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(e){
        e.preventDefault();
        const name = document.getElementById("nama").value.trim();
        const nidn = document.getElementById("nidn").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (password !== confirmPassword) {
            document.getElementById("registrasiMessage").innerText = "Password dan konfirmasi password tidak cocok.";
            return;
        }

        try {
            await registerRequest(name, email, password, nidn);
            Toast.success("Registrasi berhasil. Silakan tunggu konfirmasi dari Dosen");
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 3000);
        } catch (error) {
            console.error("Error saat registrasi:", error);
            Toast.error("Registrasi gagal. Silakan coba lagi.");
        }

    });
}

    