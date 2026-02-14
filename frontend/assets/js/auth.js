import { loginRequest } from "./api.js";
import { logoutRequest } from "./api.js";
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("btn-logout");

if (loginForm) {
    loginForm.addEventListener("submit", async function(e){
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const result = await loginRequest(email, password);

        if(result.token){
            localStorage.setItem("token", result.token);
            localStorage.setItem("role", result.role);
            localStorage.setItem("name", result.name);
            localStorage.setItem("nidn", result.nidn);

            window.location.href = "dashboard.html";
        }
        else {
            document.getElementById("loginMessage").innerText = result.message;
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function(e){
        e.preventDefault();
        await logoutRequest();
        localStorage.clear();
        window.location.href = "index.html";
    });
}
