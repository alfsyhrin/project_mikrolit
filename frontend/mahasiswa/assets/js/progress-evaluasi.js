import { getModuleLearningRequest } from "../../../assets/api.js";

/**
 * Orchestrator halaman progress-evaluasi
 */
export async function renderProgressEvaluasiPage() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("[renderProgressEvaluasiPage] Token tidak ditemukan");
            return;
        }

        const response = await getModuleLearningRequest(token);

        if (!response?.success || !Array.isArray(response.data)) {
            console.error("[renderProgressEvaluasiPage] Response tidak valid:", response);
            return;
        }

        const modules = response.data;

        renderProgressEvaluasiSummary(modules);
        renderRekapitulasiModul(modules);
        renderProgressEvaluasiCharts(modules);

        console.log("[renderProgressEvaluasiPage] Render berhasil");
    } catch (error) {
        console.error("[renderProgressEvaluasiPage] Error:", error);
    }
}

function renderProgressEvaluasiCharts(modules) {
    const progressChartData = buildProgressChartData(modules);
    const learningChartData = buildLearningDurationChartData(modules);

    if (window.renderProgressMingguanChart) {
        window.renderProgressMingguanChart(progressChartData);
    }

    if (window.renderWaktuBelajarChart) {
        window.renderWaktuBelajarChart(learningChartData);
    }
}

/**
 * Render card monitoring summary
 */
function renderProgressEvaluasiSummary(modules) {
    const averageProgressEl = document.querySelector(".rata-penyelesaian-count");
    const averageProgressLabelEl = document.querySelector(".rata-penyelesaian-label");
    const durationBelajarEl = document.querySelector(".durasi-belajar-count");
    const modulSummaryEl = document.querySelector(".modul-summary-count");
    const modulSummaryAlertEl = document.querySelector(".modul-summary-alert");

    const averageProgress = calculateAverageProgress(modules);
    const totalLearningSeconds = calculateTotalLearningSeconds(modules);
    const formattedLearningDuration = formatLearningDuration(totalLearningSeconds);
    const completedModules = countCompletedModules(modules);
    const totalModules = countTotalModules(modules);
    const incompleteModules = countIncompleteModules(modules);

    if (averageProgressEl) {
        averageProgressEl.textContent = `${averageProgress}%`;
    }

    if (averageProgressLabelEl) {
        averageProgressLabelEl.textContent = "Rata-rata Progress";
    }

    if (durationBelajarEl) {
        durationBelajarEl.textContent = formattedLearningDuration;
    }

    if (modulSummaryEl) {
        modulSummaryEl.textContent = `${completedModules}/${totalModules}`;
    }

    if (modulSummaryAlertEl) {
        // reset class state dulu supaya aman saat SPA render ulang
        modulSummaryAlertEl.classList.remove("success-alert");

        if (totalModules > 0 && incompleteModules === 0) {
            modulSummaryAlertEl.textContent = "Semua Modul Selesai";
            modulSummaryAlertEl.classList.add("success-alert");
        } else {
            modulSummaryAlertEl.textContent = `${incompleteModules} Modul Belum Selesai`;
        }
    }
}

/**
 * Render isi tabel rekapitulasi modul
 */
function renderRekapitulasiModul(modules) {
    const tbody = document.querySelector(".card-tabel-mahasiswa tbody");

    if (!tbody) {
        console.warn("[renderRekapitulasiModul] tbody tabel tidak ditemukan");
        return;
    }

    tbody.innerHTML = "";

    if (!modules.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">Belum ada modul tersedia.</td>
            </tr>
        `;
        return;
    }

    modules.forEach((module) => {
        const row = createRekapitulasiRow(module);
        tbody.appendChild(row);
    });
}

/**
 * Buat 1 row rekapitulasi modul
 */
function createRekapitulasiRow(module) {
    const {
        title,
        completed_steps = 0
    } = module;

    const step1Status = getStepCompletionStatus(1, completed_steps);
    const step2Status = getStepCompletionStatus(2, completed_steps);
    const step3Status = getStepCompletionStatus(3, completed_steps);

    const row = document.createElement("tr");

    row.innerHTML = `
        <td class="nama">${escapeHtml(title || "Modul Tanpa Judul")}</td>

        <td>
            <div class="wrapper-flex">
                <p class="${getStepStatusClass(step1Status)}">${step1Status}</p>
            </div>
        </td>

        <td>
            <div class="wrapper-flex">
                <p class="${getStepStatusClass(step2Status)}">${step2Status}</p>
            </div>
        </td>

        <td>
            <div class="wrapper-flex">
                <p class="${getStepStatusClass(step3Status)}">${step3Status}</p>
            </div>
        </td>
    `;

    return row;
}

/**
 * Helper status step berdasarkan completed_steps
 */
function getStepCompletionStatus(stepIndex, completedSteps) {
    const completed = Number(completedSteps || 0);
    return stepIndex <= completed ? "Selesai" : "Belum Selesai";
}

/**
 * Helper class status step
 */
function getStepStatusClass(statusText) {
    return statusText === "Selesai" ? "step-selesai" : "step-belum-selesai";
}

//helper categories modul
function buildModuleCategories(modules) {
    if (!Array.isArray(modules)) return [];
    return modules.map((_, index) => `M${index + 1}`);
}

//helper tooltip label asli modul
function buildModuleTitles(modules) {
    if (!Array.isArray(modules)) return [];
    return modules.map((module, index) => module.title || `Modul ${index + 1}`);
}

//helper series penyelesaian
function buildProgressSeries(modules) {
    if (!Array.isArray(modules)) return [];
    return modules.map(module => Number(module.progress_percent || 0));
}

//helper series waktu belajar
function buildLearningHoursSeries(modules) {
    if (!Array.isArray(modules)) return [];
    return modules.map(module => {
        const totalSeconds = Number(module.total_duration_seconds || 0);
        return Math.round((totalSeconds / 3600) * 10) / 10;
    });
}

//helper chart payload
function buildProgressChartData(modules) {
    return {
        categories: buildModuleCategories(modules),
        moduleTitles: buildModuleTitles(modules),
        series: buildProgressSeries(modules)
    };
}

function buildLearningDurationChartData(modules) {
    const hoursSeries = buildLearningHoursSeries(modules);
    const maxValue = Math.max(...hoursSeries, 0);

    return {
        categories: buildModuleCategories(modules),
        moduleTitles: buildModuleTitles(modules),
        series: hoursSeries,
        yAxisMax: maxValue <= 0 ? 1 : Math.ceil(maxValue)
    };
}

/**
 * Helper hitung rata-rata progress
 */
function calculateAverageProgress(modules) {
    if (!Array.isArray(modules) || modules.length === 0) return 0;

    const totalProgress = modules.reduce((sum, module) => {
        return sum + Number(module.progress_percent || 0);
    }, 0);

    return Math.round(totalProgress / modules.length);
}

/**
 * Helper jumlah total detik belajar
 */
function calculateTotalLearningSeconds(modules) {
    if (!Array.isArray(modules) || modules.length === 0) return 0;

    return modules.reduce((total, module) => {
        return total + Number(module.total_duration_seconds || 0);
    }, 0);
}

/**
 * Helper format angka desimal
 */
function formatDecimal(value) {
    const rounded = Math.round(value * 10) / 10;
    return rounded.toString().replace(".", ",");
}

/**
 * Helper format durasi belajar
 */
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

/**
 * Helper hitung modul selesai
 */
function countCompletedModules(modules) {
    if (!Array.isArray(modules)) return 0;
    return modules.filter(module => Number(module.progress_percent) === 100).length;
}

/**
 * Helper hitung total modul
 */
function countTotalModules(modules) {
    if (!Array.isArray(modules)) return 0;
    return modules.length;
}

/**
 * Helper hitung modul belum selesai
 */
function countIncompleteModules(modules) {
    return Math.max(0, countTotalModules(modules) - countCompletedModules(modules));
}

/**
 * Escape HTML
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

window.renderProgressEvaluasiPage = renderProgressEvaluasiPage;