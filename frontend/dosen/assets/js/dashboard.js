import { getUsersRequest, getNotificationForTeacher } from '../../../assets/api.js'
import { renderMahasiswaChart } from './chart.js';

// ============ FUNGSI NOTIFIKASI DOSEN ============

/**
 * Format waktu relative: "Baru saja", "5 menit lalu", "2 jam lalu", "1 hari lalu"
 */
function timeAgoTeacher(isoDate) {
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

/**
 * Mapping tipe notifikasi ke icon material symbols
 */
function getIconByType(type) {
    const iconMap = {
        'task_submitted': 'assignment',           // Pengumpulan Tugas
        'student_registered': 'schedule',          // Registrasi Mahasiswa
        'module_completed': 'assignment_turned_in', // Modul Selesai
        'message_sent': 'chat'                    // Diskusi Forum
    };
    return iconMap[type] || 'notifications';
}

/**
 * Get CSS class untuk styling icon berdasarkan tipe
 */
function getIconClassByType(type) {
    const classMap = {
        'task_submitted': 'tugas',
        'student_registered': 'schedule',
        'module_completed': 'selesai',
        'message_sent': 'diskusi'
    };
    return classMap[type] || '';
}

/**
 * Build HTML markup untuk satu notifikasi
 */
function buildTeacherNotificationMarkup(notif) {
    const type = notif.type || 'notifications';  // Default jika type tidak ada
    const icon = getIconByType(type);
    const iconClass = getIconClassByType(type);
    const time = timeAgoTeacher(notif.created_at);
    
    console.log('[buildTeacherNotificationMarkup] notif:', notif); // Debug
    
    return `
    <div class="card-notifikasi-terbaru" data-id="${notif.id}" data-type="${type}">
        <div class="icon-info-wrapper">
            <p class="icon-notifikasi ${iconClass}">
                <span class="material-symbols-outlined">${icon}</span>
            </p>
            <div class="info-notifikasi">
                <h5>${escapeHtml(notif.message)}</h5>
                <p>${time}</p>
            </div>
        </div>
    </div>
    `;
}

/**
 * Fetch dan render notifikasi dosen
 * @param {string} token - Auth token
 * @param {string} targetSelector - Selector elemen container notifikasi (default: .card-notifikasi-wrapper)
 * @param {number} limit - Jumlah notifikasi yang ditampilkan (default: 10)
 */
async function fetchAndRenderTeacherNotifications(token, targetSelector = '.card-notifikasi-wrapper', limit = 10) {
    const container = document.querySelector(targetSelector);
    if (!container) {
        console.warn(`fetchAndRenderTeacherNotifications: selector "${targetSelector}" not found`);
        return;
    }

    try {
        const result = await getNotificationForTeacher(token);
        
        // Handle response structure {success, data}
        let notifications = [];
        if (result && result.data && Array.isArray(result.data)) {
            notifications = result.data;
        } else if (Array.isArray(result)) {
            notifications = result;
        }

        console.log('[fetchAndRenderTeacherNotifications] Total notifikasi:', notifications.length);

        if (notifications.length === 0) {
            container.innerHTML = `<p style="padding:16px">Tidak ada notifikasi</p>`;
            return;
        }

        // Render hanya limit items
        const slice = notifications.slice(0, limit);
        container.innerHTML = slice.map(buildTeacherNotificationMarkup).join("");

        // Attach click handlers
        // Attach click handlers
        container.querySelectorAll('.card-notifikasi-terbaru').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                const id = card.dataset.id;
                
                let page = 'beranda';
                
                // Map notification type ke halaman
                if (type === 'task_submitted') {
                    page = 'manajemen-tugas';
                    console.log('Navigate to task detail:', id);
                } else if (type === 'student_registered') {
                    page = 'manajemen-pengguna';
                    console.log('Navigate to user management:', id);
                } else if (type === 'module_completed') {
                    page = 'monitoring';
                    console.log('Navigate to monitoring:', id);
                } else if (type === 'message_sent') {
                    page = 'monitoring'; // atau halaman diskusi jika ada
                    console.log('Navigate to discussion:', id);
                }
                
                // Simulasi click pada sidebar link
                const link = document.querySelector(`.sidebar-list a[data-page="${page}"]`);
                if (link) {
                    link.click();  // Trigger click event yang sudah ada
                } else {
                    console.warn(`Link dengan data-page="${page}" tidak ditemukan`);
                }
            });
        });

    } catch (err) {
        console.error('[fetchAndRenderTeacherNotifications] Error:', err);
        container.innerHTML = `<p style="padding:16px">Gagal memuat notifikasi</p>`;
    }
}

// helper: escape HTML to avoid injection from API data
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============ FUNGSI MAHASISWA (EXISTING) ============

async function fetchMahasiswa() {
    const token = localStorage.getItem("token");
    try {
        const users = await getUsersRequest(token);
        console.log('[fetchMahasiswa] total users:', Array.isArray(users) ? users.length : users);

        const acceptedStatuses = ['diterima', 'disetujui', 'approved'];
        const mahasiswa = (users || []).filter(user =>
            (user.role || '').toLowerCase() === 'mahasiswa' &&
            acceptedStatuses.includes(((user.status || '') + '').toLowerCase())
        );

        console.log('[fetchMahasiswa] filtered mahasiswa:', mahasiswa.length, mahasiswa);
        renderMahasiswaCardDashboard(mahasiswa);
        renderMahasiswaChart(mahasiswa);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function renderMahasiswaCardDashboard(mahasiswa) {
    const content = document.querySelector('.content');
    if (!content) {
        console.warn('renderMahasiswaCardDashboard: .content not found');
        return;
    }
    const mahasiswaCard = content.querySelector('.daftar-mahasiswa-wrapper');
    if (!mahasiswaCard) {
        console.warn('renderMahasiswaCardDashboard: .daftar-mahasiswa-wrapper not found inside .content');
        return;
    }

    mahasiswaCard.innerHTML = '';
    if (!mahasiswa || mahasiswa.length === 0) {
        mahasiswaCard.innerHTML = `<p class="mahasiswa-empty">Tidak ada mahasiswa disetujui</p>`;
        return;
    }

    mahasiswa.forEach(mhs => {
        const displayNidn = mhs.nidn || mhs.nim || '-';
        const displayName = mhs.name || mhs.nama || 'Nama tidak tersedia';

        // Tentukan status per user: jika status termasuk 'diterima' (atau varian), tampilkan "Aktif"
        const isAccepted = ['diterima', 'disetujui', 'approved'].includes(((mhs.status || '') + '').toLowerCase());
        const statusMhs = isAccepted ? 'Aktif' : 'Pasif';

        mahasiswaCard.innerHTML += `
            <div class="card-mahasiswa-data">
                <div class="info-mahasiswa">
                    <h5>${escapeHtml(displayName)}</h5>
                    <p>${escapeHtml(displayNidn)}</p>
                </div>
                <p class="${statusMhs === 'Aktif' ? 'icon-aktif' : 'icon-pasif'}">${statusMhs}</p>
            </div>
        `;
    });
}

// // helper: escape HTML to avoid injection from API data
// function escapeHtml(str) {
//     return String(str)
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#39;');
// }

async function updateMahasiswaStatsCards() {
    const token = localStorage.getItem("token");
    try {
        const users = await getUsersRequest(token);
        
        const acceptedStatuses = ['diterima', 'disetujui', 'approved'];
        const allMahasiswa = (users || []).filter(user =>
            (user.role || '').toLowerCase() === 'mahasiswa'
        );

        // Hitung mahasiswa aktif (diterima/disetujui/approved)
        const aktivCount = allMahasiswa.filter(m =>
            acceptedStatuses.includes((m.status || '').toLowerCase())
        ).length;

        // Hitung mahasiswa pending
        const pendingCount = allMahasiswa.filter(m =>
            (m.status || '').toLowerCase() === 'pending'
        ).length;

        // Update card di HTML (card kedua = Mahasiswa Terdaftar)
        const cards = document.querySelectorAll('.card-beranda');
        if (cards.length >= 2) {
            const h2 = cards[1].querySelector('h2');
            const p = cards[1].querySelector('h5');
            
            if (h2) h2.textContent = aktivCount;
            if (p) p.textContent = pendingCount > 0 ? `+${pendingCount}` : pendingCount;
        }

        console.log('[updateMahasiswaStatsCards] Aktif:', aktivCount, 'Pending:', pendingCount);
    } catch (error) {
        console.error('Error updating mahasiswa stats:', error);
    }
}

/**
 * Helper untuk mendapatkan total mahasiswa aktif (diterima/approved)
 * @returns {number} - Jumlah mahasiswa aktif
 */
function getTotalActiveMahasiswa() {
    // Hitung dari allUsers atau fetch baru jika perlu
    const token = localStorage.getItem("token");
    
    // Jika perlu real-time dari fetch
    return new Promise(async (resolve) => {
        try {
            const users = await getUsersRequest(token);
            const acceptedStatuses = ['diterima', 'disetujui', 'approved'];
            const aktivCount = (users || []).filter(user =>
                (user.role || '').toLowerCase() === 'mahasiswa' &&
                acceptedStatuses.includes((user.status || '').toLowerCase())
            ).length;
            resolve(aktivCount);
        } catch (error) {
            console.error('Error getTotalActiveMahasiswa:', error);
            resolve(0);
        }
    });
}

export { 
    fetchMahasiswa, 
    updateMahasiswaStatsCards, 
    getTotalActiveMahasiswa,
    fetchAndRenderTeacherNotifications  // Export untuk digunakan di dashboard.html
};