const API_BASE = "https://12e5-180-243-36-192.ngrok-free.app/api";

export async function loginRequest(email, password){
    const response = await fetch(API_BASE + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    return response.json();
}

export async function logoutRequest(){
    await fetch(API_BASE + "/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
}

export async function registerRequest(name, email, password, nidn){
    const response = await fetch(API_BASE + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, nidn })
    });
}
