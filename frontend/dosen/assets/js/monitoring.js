import { monitoringRequest } from "../../../assets/api.js";

/**
 * Helper: Hitung jarak waktu dari last_access ke sekarang
 * @param {string} lastAccess - ISO datetime string
 * @returns {string} - Format "X jam lalu", "X hari lalu", etc
 */
function formatTimeAgo(lastAccess) {
    if (!lastAccess) return "-";
    
    const now = new Date();
    const past = new Date(lastAccess);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return past.toLocaleDateString("id-ID");
}

/**
 * Helper: Convert seconds ke format jam/menit
 * @param {number} seconds - Total durasi dalam detik
 * @returns {string} - Format "X jam" atau "X menit"
 */
function formatDuration(seconds) {
    const sec = parseInt(seconds) || 0;
    if (sec === 0) return "-";
    
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    
    if (hours > 0) {
        return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
    }
    return `${mins} menit`;
}

/**
 * Render tabel Progress Mahasiswa dari monitoring API
 * @param {string} token - Auth token
 */
/**
 * Render tabel Progress Mahasiswa dari monitoring API
 * @param {string} token - Auth token
 */
async function renderMonitoringTable(token) {
    try {
        const response = await monitoringRequest(token);
        
        if (!response.success || !Array.isArray(response.data)) {
            console.error("[renderMonitoringTable] Invalid response:", response);
            return;
        }

        const tbody = document.querySelector(".card-tabel-mahasiswa tbody");
        if (!tbody) {
            console.warn("[renderMonitoringTable] tbody not found");
            return;
        }

        // Hapus row template yang ada
        tbody.innerHTML = "";

        // Render setiap mahasiswa
        response.data.forEach(data => {
            const row = document.createElement("tr");
            const lastModule = data.last_module || "-";
            const lastAccess = formatTimeAgo(data.last_access);
            const totalDurasi = formatDuration(data.total_duration_seconds);
            const progressPercent = parseInt(data.progress_percent) || 0;

            // 🔥 Set user_id
            row.dataset.userId = data.user_id;

            // 🔥 Ambil module_id dari discussion_points (yang paling baru)
            if (Array.isArray(data.discussion_points) && data.discussion_points.length > 0) {
                // Ambil discussion point yang paling baru berdasarkan created_at
                const latestDiscussionPoint = data.discussion_points.reduce((latest, current) => {
                    return new Date(current.created_at) > new Date(latest.created_at) 
                        ? current 
                        : latest;
                });
                row.dataset.moduleId = latestDiscussionPoint.module_id;
            } else {
                row.dataset.moduleId = null;
            }

            row.innerHTML = `
                <td class="nama">${data.name || "-"}</td>
                <td class="muted">${lastModule}</td>
                <td class="muted">${lastAccess}</td>
                <td class="muted">${totalDurasi}</td>
                <td>
                    <div class="progress-wrapper">
                        <div class="progress">
                            <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        </div>
                        <span class="percentage">${progressPercent}%</span>
                    </div>
                </td>
                <td class="middle-td">
                    <p class="step-two-btn" id="btnLihatHasilStep">
                        <span class="material-symbols-outlined">visibility</span>
                    </p>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log("[renderMonitoringTable] Berhasil render", response.data.length, "mahasiswa");
    } catch (error) {
        console.error("[renderMonitoringTable] Error:", error);
    }
}

/**
 * Helper: Format tanggal dari ISO string
 * @param {string} isoDateString - ISO datetime string
 * @returns {object} - { date: "DD/MM/YYYY", time: "HH.mm WIT" }
 */
function formatDateTimeFromISO(isoDateString) {
    if (!isoDateString) return { date: "-", time: "-" };
    
    const date = new Date(isoDateString);
    
    // Format tanggal DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // Format waktu HH.mm WIT
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}.${minutes} WIT`;
    
    return { date: formattedDate, time: formattedTime };
}

/**
 * Ambil discussion point berdasarkan userId dan moduleId
 * @param {Array} monitoringData - Array dari monitoringRequest response
 * @param {number} userId - User ID yang dicari
 * @param {number} moduleId - Module ID yang dicari
 * @returns {object|null} - Discussion point object atau null jika tidak ditemukan
 */
function getDiscussionPoint(monitoringData, userId, moduleId) {
    const user = monitoringData.find(item => item.user_id === userId);
    if (!user || !Array.isArray(user.discussion_points)) return null;
    
    return user.discussion_points.find(dp => dp.module_id === moduleId) || null;
}

/**
 * Ambil dan format data step 2 yang diperlukan untuk modal
 * @param {Array} monitoringData - Data dari monitoringRequest
 * @param {number} userId - Student user ID
 * @param {number} moduleId - Module ID
 * @returns {object|null} - { discussionPoint, date, time, studentName } atau null
 */
function getStepTwoData(monitoringData, userId, moduleId) {
    const discussionPoint = getDiscussionPoint(monitoringData, userId, moduleId);
    
    if (!discussionPoint) {
        console.warn(`[getStepTwoData] No discussion point found for userId: ${userId}, moduleId: ${moduleId}`);
        return null;
    }
    
    const { date, time } = formatDateTimeFromISO(discussionPoint.created_at);
    const studentName = monitoringData.find(item => item.user_id === userId)?.name || "Mahasiswa";
    
    return {
        discussionPoint: discussionPoint.discussion_point || "-",
        date: date,
        time: time,
        studentName: studentName
    };
}

/**
 * Helper: Hitung rata-rata durasi belajar dari semua mahasiswa dan format ke jam/menit/detik
 * @param {Array} monitoringData - Array dari monitoringRequest response
 * @returns {string} - Format "X jam Y menit Z detik" atau lebih ringkas tergantung nilai
 * Contoh: "3 jam 45 menit", "2 menit 30 detik", "45 detik"
 */
function calculateAverageDuration(monitoringData) {
    if (!Array.isArray(monitoringData) || monitoringData.length === 0) {
        return "0 detik";
    }
    
    const totalSeconds = monitoringData.reduce((sum, item) => {
        return sum + (parseInt(item.total_duration_seconds) || 0);
    }, 0);
    
    const averageSeconds = totalSeconds / monitoringData.length;
    
    // Convert ke jam, menit, detik
    const hours = Math.floor(averageSeconds / 3600);
    const minutes = Math.floor((averageSeconds % 3600) / 60);
    const seconds = Math.round(averageSeconds % 60);
    
    // Build format string yang dinamis
    const parts = [];
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    if (seconds > 0) parts.push(`${seconds} detik`);
    
    // Jika semuanya kosong, return 0 detik
    return parts.length > 0 ? parts.join(" ") : "0 detik";
}

/**
 * Helper: Hitung delta/pertambahan progress dari mahasiswa yang sudah complete
 * @param {Array} monitoringData - Array dari monitoringRequest response
 * @returns {number} - Persentase mahasiswa yang sudah mencapai 100% progress
 */
function calculateProgressDelta(monitoringData) {
    if (!Array.isArray(monitoringData) || monitoringData.length === 0) {
        return 0;
    }
    
    const completedStudents = monitoringData.filter(item => {
        return parseInt(item.progress_percent) === 100;
    }).length;
    
    const deltaPercent = Math.round((completedStudents / monitoringData.length) * 100);
    return deltaPercent;
}

/**
 * Helper: Hitung rata-rata penyelesaian modul dari semua mahasiswa
 * @param {Array} monitoringData - Array dari monitoringRequest response
 * @returns {number} - Rata-rata progress dalam persen (0-100)
 */
function calculateAverageProgress(monitoringData) {
    if (!Array.isArray(monitoringData) || monitoringData.length === 0) {
        return 0;
    }
    
    const totalProgress = monitoringData.reduce((sum, item) => {
        return sum + (parseInt(item.progress_percent) || 0);
    }, 0);
    
    const average = Math.round(totalProgress / monitoringData.length);
    return average;
}

export { renderMonitoringTable, getStepTwoData, getDiscussionPoint, calculateAverageDuration, calculateAverageProgress, calculateProgressDelta };