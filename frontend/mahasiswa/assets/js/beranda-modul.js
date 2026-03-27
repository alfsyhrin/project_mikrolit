import { getModuleLearningRequest } from "../../../assets/api.js";

export async function renderBerandaModul(limit = 3) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("[renderBerandaModul] Token tidak ditemukan");
            return;
        }

        const response = await getModuleLearningRequest(token);

        if (!response?.success || !Array.isArray(response.data)) {
            console.error("[renderBerandaModul] Response tidak valid:", response);
            return;
        }

        const modules = response.data;

        renderBerandaSummary(modules);
        renderBerandaModuleList(modules, limit);

    } catch (error) {
        console.error("[renderBerandaModul] Error:", error);
    }
}

function calculateTotalLearningSeconds(modules) {
    if (!Array.isArray(modules) || modules.length === 0) return 0;

    return modules.reduce((total, module) => {
        return total + Number(module.total_duration_seconds || 0);
    }, 0);
}

function formatLearningDuration(totalSeconds) {
    const seconds = Number(totalSeconds || 0);

    if (seconds < 60) {
        const roundedSeconds = Math.max(1, Math.round(seconds));
        return `${roundedSeconds} detik`;
    }

    const minutes = seconds / 60;
    if (minutes < 60) {
        return `${formatDecimal(minutes)} menit`;
    }

    const hours = seconds / 3600;
    return `${formatDecimal(hours)} jam`;
}

function formatDecimal(value) {
    const rounded = Math.round(value * 10) / 10;
    return rounded.toString().replace(".", ",");
}

function renderWaktuBelajar(modules) {
    const waktuBelajarEl = document.querySelector(".waktu-belajar-count");

    if (!waktuBelajarEl) {
        console.warn("[renderWaktuBelajar] Elemen .waktu-belajar-count tidak ditemukan");
        return;
    }

    const totalSeconds = calculateTotalLearningSeconds(modules);
    const formattedDuration = formatLearningDuration(totalSeconds);

    waktuBelajarEl.textContent = formattedDuration;
}

function renderBerandaSummary(modules) {
    const completedCountEl = document.querySelector(".modul-selesai-count");
    const progressTotalEl = document.querySelector(".progress-total-count");

    if (!completedCountEl || !progressTotalEl) {
        console.warn("[renderBerandaSummary] Elemen summary tidak ditemukan");
        return;
    }

    const completedModules = countCompletedModules(modules);
    const totalModules = countTotalModules(modules);
    const averageProgress = calculateAverageProgress(modules);

    completedCountEl.textContent = `${completedModules}/${totalModules}`;
    progressTotalEl.textContent = `${averageProgress}%`;
    renderWaktuBelajar(modules);
}

function renderBerandaModuleList(modules, limit = 3) {
    const container = document.querySelector(".wrapper-card-modul-mahasiswa");

    if (!container) {
        console.warn("[renderBerandaModuleList] Container modul tidak ditemukan");
        return;
    }

    const displayedModules = modules.slice(0, limit);

    container.innerHTML = "";

    if (displayedModules.length === 0) {
        container.innerHTML = `
            <div class="empty-state-modul">
                <p>Belum ada modul yang tersedia.</p>
            </div>
        `;
        return;
    }

    displayedModules.forEach((module) => {
        const card = createBerandaModuleCard(module);
        container.appendChild(card);
    });
}

function createBerandaModuleCard(module) {
    const {
        id,
        title,
        description,
        progress_percent = 0,
        completed_steps = 0,
        total_steps = 0
    } = module;

    const { statusText, statusClass } = getModuleStatus(progress_percent);
    const nextStep = Math.min(completed_steps + 1, total_steps || 1);

    const card = document.createElement("div");
    card.className = "card-modul-mahasiswa";
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

            ${progress_percent > 0 && progress_percent < 100 ? `
                <a href="#" class="lanjut-belajar-modul" data-page="modul" data-module-id="${id}">
                    <span class="material-symbols-outlined">play_arrow</span>
                    Lanjut belajar - Step ${nextStep}/${total_steps}
                </a>
            ` : ""}

            ${Number(progress_percent) === 0 ? `
                <a href="#" class="lanjut-belajar-modul" data-page="modul" data-module-id="${id}">
                    <span class="material-symbols-outlined">play_arrow</span>
                    Mulai belajar
                </a>
            ` : ""}

            ${Number(progress_percent) === 100 ? `
                <a href="#" class="lanjut-belajar-modul" data-page="modul" data-module-id="${id}">
                    <span class="material-symbols-outlined">visibility</span>
                    Lihat kembali
                </a>
            ` : ""}
        </div>
    `;

    return card;
}

function getModuleStatus(progressPercent) {
    const progress = Number(progressPercent);

    if (progress === 0) {
        return {
            statusText: "Belum Dimulai",
            statusClass: "belum-dimulai"
        };
    }

    if (progress > 0 && progress < 100) {
        return {
            statusText: "Sedang Berlangsung",
            statusClass: "sedang-berlangsung"
        };
    }

    return {
        statusText: "Selesai",
        statusClass: "selesai"
    };
}

function countCompletedModules(modules) {
    if (!Array.isArray(modules)) return 0;
    return modules.filter(module => Number(module.progress_percent) === 100).length;
}

function countTotalModules(modules) {
    if (!Array.isArray(modules)) return 0;
    return modules.length;
}

function calculateAverageProgress(modules) {
    if (!Array.isArray(modules) || modules.length === 0) return 0;

    const totalProgress = modules.reduce((sum, module) => {
        return sum + Number(module.progress_percent || 0);
    }, 0);

    return Math.round(totalProgress / modules.length);
}

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