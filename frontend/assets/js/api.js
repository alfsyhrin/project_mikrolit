const API_BASE = "http://localhost:4000/api";

export async function loginRequest(emailOrNidn, password){
    const body = {};

    if (emailOrNidn.includes("@")) { 
        body.email = emailOrNidn;
    } else{
        body.nidn = emailOrNidn;
    }

    body.password = password;

    const response = await fetch(API_BASE + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
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

export async function getUsersRequest(token){
    const response = await fetch(API_BASE + "/users", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function updateUserStatusRequest(userId, status, token){
    const statusMap = {
        "diterima": "approved",
        "ditolak": "rejected"
    };

    const response = await fetch(API_BASE + `/users/${userId}/status`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    return response.json();
}