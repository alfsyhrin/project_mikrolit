const API_BASE = "https://5c16-2001-448a-7100-2c47-345c-87d0-6c98-a6fc.ngrok-free.app/api";

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
