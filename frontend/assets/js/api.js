const API_BASE = "https://erica-slatier-neoma.ngrok-free.dev/api";

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
        "ngrok-skip-browser-warning": "true",
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
        "ngrok-skip-browser-warning": "true",
        body: JSON.stringify({ name, email, password, nidn })
    });
}

export async function getUsersRequest(token){
    const response = await fetch(API_BASE + "/users", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
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
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    return response.json();
}

export async function getProfileRequest(token){
    const response = await fetch(API_BASE + "/profile", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function updateProfileRequest(name, email, nidn, photoFile, token){
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("nidn", nidn);
    
    if (photoFile) {
        formData.append("photo", photoFile);
    }

    const response = await fetch(API_BASE + "/profile", {
        method: "PUT",
        headers: {
            // Jangan set Content-Type, biarkan browser yang atur boundary
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: formData
    }); 
    
    return response.json();
}

export async function updatePasswordRequest(currentPassword, newPassword, token){
    const response = await fetch(API_BASE + "/profile/password", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    });

    return response.json();
}

export async function deletePhotoRequest(token){
    const response = await fetch(API_BASE + "/profile/photo", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}