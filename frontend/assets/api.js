const API_BASE = "http://localhost:4000/api";

//AUTH===================================================================================
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

//====================================================================================

//REGISTER============================================================================
export async function registerRequest(name, email, password, nidn){
    const response = await fetch(API_BASE + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        "ngrok-skip-browser-warning": "true",
        body: JSON.stringify({ name, email, password, nidn })
    });
}
//====================================================================================

//USERS (DOSEN) ======================================================================
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
//======================================================================================

//PROFILE (SEMUA USER) =================================================================
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
//====================================================================================

//MODULES & WRITING TASKS (DOSEN) ====================================================
export async function getModulesRequest(token){
    const response = await fetch(API_BASE + "/modules", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function getTaskForDosenRequest(token){
    const response = await fetch(API_BASE + "/writing/tasks", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });
    return response.json();
}

export async function createTaskRequest(moduleId, taskTitle, instructions, attachmentFile, deadline, token){
    const formData = new FormData();
    formData.append("module_id", moduleId);
    formData.append("task_title", taskTitle);
    formData.append("instructions", instructions);
    formData.append("deadline", deadline);
    if (attachmentFile) {
        formData.append("attachment", attachmentFile);
    }

    const response = await fetch(API_BASE + "/writing/task", {
        method: "POST",
        headers: {
            "ngrok-skip-browser-warning": "true",
            // "content-type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    return response.json();
}

export async function updateTaskRequest(taskId, moduleId, taskTitle, instructions, attachmentFile, deadline, token){
    const formData = new FormData();
    if (moduleId) formData.append("module_id", moduleId);
    if (taskTitle) formData.append("task_title", taskTitle);
    if (instructions) formData.append("instructions", instructions);
    if (deadline) formData.append("deadline", deadline);
    if (attachmentFile) {
        formData.append("attachment", attachmentFile);
    }

    const response = await fetch(API_BASE + `/writing/task/${taskId}`, {
        method: "PUT",
        headers: {
            "ngrok-skip-browser-warning": "true",
            // "content-type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    return response.json();
}

export async function deleteTaskRequest(taskId, token){
    const response = await fetch(API_BASE + `/writing/task/${taskId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function getSubmissionsByTaskRequest(taskId, token){
    const response = await fetch(API_BASE + `/writing/submissions/${taskId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function downloadSubmissionsZipRequest(taskId, token){
    const response = await fetch(API_BASE + `/writing/task/${taskId}/submissions/zip`, {
        method: "GET",
        headers: {
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.blob();
}

export async function createModuleRequest(moduleData, token){
    const response = await fetch(API_BASE + "/modules", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(moduleData)
    });
    return response.json();
}

// tambahkan ini di frontend/assets/api.js
export async function uploadFileResourceRequest(file, token){
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(API_BASE + "/module-resources/upload", {
        method: "POST",
        headers: {
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
        },
        body: fd
    });

    return res.json();
}

export async function getModuleListRequest(token){
    const response = await fetch(API_BASE + "/monitoring/modules/dashboard", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function updateModuleRequest(moduleId, moduleData, token){
    const response = await fetch(API_BASE + `/modules/${moduleId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(moduleData)
    });
    return response.json();
}

export async function deleteModuleRequest(moduleId, token){
    const response = await fetch(API_BASE + `/modules/${moduleId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });
    return response.json();
}

export async function getCompleteStudentByModuleIdRequest(moduleId, token){
    const response = await fetch(API_BASE + `/monitoring/modules/${moduleId}/completed-students`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });
    return response.json();
}

export async function getModuleById(moduleId, token){
    const response = await fetch(API_BASE + `/modules/${moduleId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        } 
    });

    return response.json();
}

export async function monitoringRequest(token){
    const response = await fetch(API_BASE + "/monitoring/students", { 
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function getNotificationForTeacher(token){
    const response = await fetch(API_BASE + "/notifications/teacher", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });
    return response.json();
}

//MODULES & TASK (MAHASISWA)=========================================================
export async function getTaskForMahasiswaRequest(token){
    const response = await fetch(API_BASE + "/writing/mahasiswa/tasks", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.json();
}

export async function downloadTaskFileRequest(taskId, token){
    const response = await fetch(API_BASE + `/writing/task/${taskId}/download`, {
        method: "GET",
        headers: {
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    return response.blob();
}

export async function submitWritingRequest(taskId, answerText, file, token){
    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("answer_text", answerText);
    if (file) {
        formData.append("file", file);
    }

    const response = await fetch(API_BASE + "/writing/submit", {
        method: "POST",
        headers: {
            "ngrok-skip-browser-warning": "true",
            // "content-type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    return response.json();
}

export async function getNotificationsRequest(token){
    const response = await fetch(API_BASE + "/notifications/students", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        }
    });

    const result = await response.json();
    // Extract data dari response {success, data}
    return result.data || [];
}
