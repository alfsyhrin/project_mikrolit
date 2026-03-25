import { getModuleLearningRequest, getModuleLearnDetailRequest } from "../../../assets/api.js";


/**
 * Render semua modul ke card di halaman daftar-modul
 */
export async function renderDaftarModul() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("[renderDaftarModul] No token found");
            return;
        }

        // Fetch data modul dengan progress
        const response = await getModuleLearningRequest(token);
        
        if (!response.success || !Array.isArray(response.data)) {
            console.error("[renderDaftarModul] Invalid response:", response);
            return;
        }

        const modules = response.data;
        const container = document.querySelector(".container-modul-mahasiswa");
        
        if (!container) {
            console.warn("[renderDaftarModul] Container not found");
            return;
        }

        // Clear container
        container.innerHTML = "";

        // Render setiap modul
        modules.forEach((module) => {
            const card = createModuleCard(module);
            container.appendChild(card);
        });

        console.log("[renderDaftarModul] Render berhasil:", modules.length, "modul");
    } catch (error) {
        console.error("[renderDaftarModul] Error:", error);
    }
}

/**
 * Helper: Buat element card untuk satu modul
 */
function createModuleCard(module) {
    const {
        id,
        title,
        description,
        progress_percent = 0,
        completed_steps = 0,
        total_steps = 0
    } = module;

    // Tentukan status berdasarkan progress
    let statusClass = "belum-dimulai";
    let statusText = "Belum Dimulai";
    
    if (progress_percent === 100) {
        statusClass = "selesai";
        statusText = "Selesai";
    } else if (progress_percent > 0) {
        statusClass = "sedang-berlangsung";
        statusText = "Sedang Berlangsung";
    }

    // Hitung next step untuk tombol "Lanjut Belajar"
    const nextStep = completed_steps + 1;
    const lanjutBelajarText = progress_percent === 100 
        ? `Lihat Kembali - Step ${total_steps}/${total_steps}`
        : `Lanjut Belajar - Step ${nextStep}/${total_steps}`;

    // Create card element
    const card = document.createElement("a");
    card.href = "#";
    card.className = "card-modul-mahasiswa-menu";
    card.setAttribute("data-page", "modul");
    card.setAttribute("data-module-id", id);

    card.innerHTML = `
        <div class="header-card-modul-mahasiswa">
            <div class="wrapper-header-card-modul-mhs">
                <p class="icon-card-modul-mahasiswa">
                    <span class="material-symbols-outlined">import_contacts</span>
                </p>
                <div class="info-judul-card-mhs">
                    <h3>${escapeHtml(title || "Modul Tanpa Judul")}</h3>
                    <p>${escapeHtml(description || "Tidak ada deskripsi")}</p>
                </div>
            </div>
            <p class="card-modul-mhs-status ${statusClass}">${statusText}</p>
        </div>
        <div class="footer-card-modul-mahasiswa">
            <div class="progress-wrapper">
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress_percent}%;"></div>
                </div>
                <span class="precentage">${progress_percent}%</span>
            </div>
            ${progress_percent < 100 ? `
                <a href="#" data-page="modul" class="lanjut-belajar-modul">
                    <span class="material-symbols-outlined">play_arrow</span>
                    ${lanjutBelajarText}
                </a>
            ` : ''}
        </div>
    `;

    return card;
}

/**
 * Render detail modul dan steps ke halaman modul.html
 */
export async function renderModuleDetail(moduleId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("[renderModuleDetail] No token found");
            return;
        }

        // ✅ GANTI - pakai function yang benar
        const response = await getModuleLearnDetailRequest(moduleId, token);
        
        if (!response.success || !response.data) {
            console.error("[renderModuleDetail] Invalid response:", response);
            return;
        }

        const { module, steps } = response.data;

        // Render module info
        renderModuleInfo(module);
        
        // Render steps
        renderModuleSteps(module.title, steps);

        console.log("[renderModuleDetail] Render berhasil untuk module:", moduleId);
    } catch (error) {
        console.error("[renderModuleDetail] Error:", error);
    }
}

/**
 * Helper: Render informasi modul (title, deskripsi, progress, objectives)
 */
function renderModuleInfo(module) {
    // Update h2 (judul modul)
    const h2 = document.querySelector(".card-modul h2");
    if (h2) h2.textContent = module.title || "Modul Tanpa Judul";

    // Update deskripsi
    const desc = document.querySelector(".deskripsi-modul");
    if (desc) desc.textContent = module.description || "Tidak ada deskripsi";

    // Update progress bar
    const progressFill = document.querySelector(".progress-fill");
    const progressPercent = document.querySelector(".progress-modul");
    const progress = module.progress_percent || 0;
    if (progressFill) progressFill.style.width = progress + "%";
    if (progressPercent) progressPercent.textContent = progress + "%";

    // Render objectives
    renderObjectives(module.objectives || []);
}

/**
 * Helper: Render learning objectives
 */
function renderObjectives(objectives) {
    const ul = document.querySelector(".learning-objectives ul");
    if (!ul) return;

    ul.innerHTML = "";
    objectives.forEach(obj => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="material-symbols-outlined">check_circle</span>
            ${escapeHtml(obj)}
        `;
        ul.appendChild(li);
    });
}

/**
 * Helper: Render module steps/urutan pembelajaran
 */
function renderModuleSteps(moduleTitle, steps) {
    // Update h3 dengan judul modul
    const h3 = document.querySelector(".card-step h3");
    if (h3) h3.textContent = `Urutan Pembelajaran (MicroLit Syntax)`;

    // Render steps container
    const wrapper = document.querySelector(".wrapper-step");
    if (!wrapper) return;

    wrapper.innerHTML = "";
    
    steps.forEach((step) => {
        const stepElement = createStepElement(step);
        wrapper.appendChild(stepElement);
    });
}

/**
 * Helper: Create single step element
 */
function createStepElement(step) {
    const { step_number, step_title, step_type, status } = step;

    // Mapping status ke class dan icon
    const statusMap = {
        'completed': { cssClass: 'selesai', icon: 'check_circle', text: 'Selesai' },
        'current': { cssClass: 'berlangsung', icon: 'progress_activity', text: 'Berlangsung' },
        'locked': { cssClass: 'terkunci', icon: 'lock', text: 'Terkunci' }
    };
    
    const statusInfo = statusMap[status] || statusMap['locked'];

    const div = document.createElement("div");
    div.className = `step-item ${statusInfo.cssClass}`;
    div.setAttribute("data-page", `modul-step${step_number}`);

    div.innerHTML = `
        <div class="step-icon ${statusInfo.cssClass}">
            <span class="material-symbols-outlined">${statusInfo.icon}</span>
        </div>

        <div class="step-info">
            <span class="step-number">STEP ${step_number}</span>
            <h4>${escapeHtml(step_type || "Step")}</h4>
            <p>${escapeHtml(step_title || "Tanpa deskripsi")}</p>
        </div>

        <span class="status ${statusInfo.cssClass}">${statusInfo.text}</span>
    `;

    return div;
}

/**
 * Helper: Escape HTML untuk prevent XSS
 */
function escapeHtml(text) {
    if (!text) return "";
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Expose ke global scope
window.renderDaftarModul = renderDaftarModul;
window.renderModuleDetail = renderModuleDetail;