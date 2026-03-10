import { getUsersRequest } from '../../../assets/api.js'

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

// helper: escape HTML to avoid injection from API data
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export { fetchMahasiswa };