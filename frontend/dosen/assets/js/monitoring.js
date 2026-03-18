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
            `;
            tbody.appendChild(row);
        });

        console.log("[renderMonitoringTable] Berhasil render", response.data.length, "mahasiswa");
    } catch (error) {
        console.error("[renderMonitoringTable] Error:", error);
    }
}

export { renderMonitoringTable };