document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    // LOGIN SEMENTARA (tanpa backend)
    if(email === "dosen@example.com" && pass === "admin123"){

        localStorage.setItem("userRole", "dosen");

        window.location.href = "dashboard.html";
    } else {
        document.getElementById("loginMessage").innerText = "Email atau password salah.";
    }
});
