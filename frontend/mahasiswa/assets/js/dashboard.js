import { getNotificationsRequest } from "../../../assets/api.js";

// Format relative time: "Baru saja", "x menit lalu", "x jam lalu", "x hari lalu"
function timeAgo(isoDate) {
    if (!isoDate) return "";
    const now = new Date();
    const d = new Date(isoDate);
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} hari lalu`;
}

function buildNotificationMarkup(n) {
    const icon = (n.type === "task") ? "task" : (n.type === "module" ? "menu_book" : "notifications");
    return `
    <div class="card-notifikasi-mhs" data-id="${n.id}" data-type="${n.type}" data-ref="${n.reference_id}">
      <p class="icon-notifikasi"><span class="material-symbols-outlined">${icon}</span></p>
      <div class="info-notifikasi-mhs">
        <h3>${escapeHtml(n.message)}</h3>
        <span class="waktu-notifikasi">${timeAgo(n.created_at)}</span>
      </div>
    </div>
    `;
}

function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

// Fetch + render. targetSelector default cocok dengan template Anda.
export async function fetchAndRenderNotifications(token, targetSelector = ".wrapper-card-notifikasi-mhs", limit = 10) {
    const container = document.querySelector(targetSelector);
    if (!container) return;
    try {
        const data = await getNotificationsRequest(token);
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `<p style="padding:16px">Tidak ada notifikasi</p>`;
            return;
        }
        const slice = data.slice(0, limit);
        container.innerHTML = slice.map(buildNotificationMarkup).join("");

        // Optional: click handling (navigasi ke resource terkait)
        container.querySelectorAll(".card-notifikasi-mhs").forEach(card => {
            card.addEventListener("click", () => {
                const type = card.dataset.type;
                const ref = card.dataset.ref;
                // contoh: jika type=task -> buka halaman tugas, jika module -> buka modul
                if (type === "task") {
                    // ganti sesuai routing SPA Anda
                    window.location.hash = `#tugas-mahasiswa`; // contoh
                    // atau load page detail: loadPage(`tugas-detail-${ref}`)
                } else if (type === "module") {
                    window.location.hash = `#daftar-modul`;
                }
            });
        });

    } catch (err) {
        console.error("Gagal ambil notifikasi:", err);
        container.innerHTML = `<p style="padding:16px">Gagal memuat notifikasi</p>`;
    }
}