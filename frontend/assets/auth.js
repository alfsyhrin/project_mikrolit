import Toast from "./toast.js";
import { loginRequest } from "./api.js";
import { logoutRequest } from "./api.js";
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("btn-logout");

if (loginForm) {
    loginForm.addEventListener("submit", async function(e){
        e.preventDefault();

        const emailOrNidn = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!emailOrNidn || !password) {
            Toast.warning("Email/NIDN dan password harus diisi");
            return;
        }

        try{
            const result = await loginRequest(emailOrNidn, password);

            if(result.token){

                localStorage.setItem("token", result.token);
                localStorage.setItem("role", result.role);
                localStorage.setItem("name", result.name);
                localStorage.setItem("nidn", result.nidn);
                localStorage.setItem("email", result.email);
                localStorage.setItem("id", result.id);

                Toast.success("Login berhasil!");

                setTimeout(() => {
                    if (result.role === "dosen") {
                        window.location.href = "./dosen/dashboard.html";
                    } 
                    else if (result.role === "mahasiswa"){
                        window.location.href = "./mahasiswa/dashboard.html";
                    }
                }, 1000);

            } else {
                Toast.error(result.message || "Login gagal");
            }

        } catch (err) {
            console.log("Error saat login:", err);
            Toast.error("Terjadi kesalahan saat login");
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function(e){
        e.preventDefault();
        
        try {
            await logoutRequest();

            Toast.info("Berhasil logout");

            setTimeout(() => {
                localStorage.clear();
                window.location.href = "../../index.html";
            }, 800);

        } catch (err) {

            console.error("Logout error:", err);

            localStorage.clear();
            window.location.href = "../../index.html";
        }
    });
}
