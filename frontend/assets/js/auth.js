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
            document.getElementById("loginMessage").innerText = "Email/NIDN dan password harus diisi.";
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

                if (result.role === "dosen") {
                    window.location.href = "dashboard.html";
                } else if (result.role === "mahasiswa"){
                    window.location.href = "dashboard-mhs.html";
                }
            }
            else {
                document.getElementById("loginMessage").innerText = result.message || "Login gagal.";
                document.getElementById("loginMessage").style.color = "red";
            }
        } catch (err) {
            console.log("Error saat login:", err);
            document.getElementById("loginMessage").innerText = "Terjadi kesalahan saat login.";
            document.getElementById("loginMessage").style.color = "red";
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function(e){
        e.preventDefault();
        
        try {
            await logoutRequest();
            localStorage.clear();
            window.location.href = "index.html";
        } catch (err) {
            console.error("Logout error:", err);
            localStorage.clear();
            window.location.href = "index.html";
        }
    });
}
