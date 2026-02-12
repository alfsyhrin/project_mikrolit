import { loginRequest } from "./api.js";

document.getElementById("loginForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const result = await loginRequest(email, password);

    if(result.token){
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);

        window.location.href = "dashboard.html";
    } else {
        document.getElementById("loginMessage").innerText = result.message;
    }
});
