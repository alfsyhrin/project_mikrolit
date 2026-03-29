import Modal from "../../../assets/modal.js";
import { 
    getTaskForMahasiswaRequest,
    submitWritingRequest,
    downloadTaskFileRequest
} from "../../../assets/api.js";

const token = localStorage.getItem("token");
let allTasks = [];
let filteredTasks = [];
let currentFilter = "Semua";
let currentSearch = "";

let isDelegationBound = false;
// let isFilterBound = false;
// let isSearchBound = false;

const activeDownloads = new Set();
const activeUploads = new Set();

// Helper untuk HTML escape
function escapeHtml(s) {
    return String(s || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

// Helper deadline
function formatDeadlineDisplay(deadline) {
    if (!deadline) return "-";
    const d = new Date(deadline);
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

//helper untuk attachment, upload, dan download
function getTaskById(taskId) {
    return allTasks.find(t => String(t.id) === String(taskId));
}

function hasAttachment(task) {
    return Boolean(task && typeof task.attachment_url === 'string' && task.attachment_url.trim() !== '');
}

function shouldDisableUpload(task) {
    if (!task) return true;

    if (task.status === "sudah dikumpulkan") {
        return true;
    }

    if (task.status === "belum dikumpulkan" && task.deadline) {
        const deadlineDate = new Date(task.deadline);
        return deadlineDate < new Date();
    }

    if (task.submitted_at && task.deadline) {
        const submittedDate = new Date(task.submitted_at);
        const deadlineDate = new Date(task.deadline);
        return submittedDate > deadlineDate;
    }

    return false;
}

function shouldDisableDownload(task) {
    return !hasAttachment(task);
}

//helper state tombol 
function getDownloadButtonState(task) {
    const disabled = shouldDisableDownload(task);

    if (disabled) {
        return {
            disabled,
            className: 'download-soal-tugas disabled',
            disabledAttr: 'disabled aria-disabled="true"',
            label: 'Download',
            title: 'Lampiran tugas tidak tersedia'
        };
    }

    return {
        disabled,
        className: 'download-soal-tugas',
        disabledAttr: '',
        label: 'Download',
        title: 'Download lampiran tugas'
    };
}

function getUploadButtonState(task) {
    const disabled = shouldDisableUpload(task);

    if (disabled) {
        return {
            disabled,
            className: 'upload-tugas terlambat',
            disabledAttr: 'disabled aria-disabled="true"',
            title: task?.status === 'sudah dikumpulkan'
                ? 'Tugas sudah dikumpulkan'
                : 'Deadline pengumpulan sudah berakhir'
        };
    }

    return {
        disabled,
        className: 'upload-tugas',
        disabledAttr: '',
        title: 'Upload jawaban tugas'
    };
}

//helper cleanname
function getCleanFileName(filePath = "") {
    if (!filePath) return "tugas";

    const rawName = String(filePath).split("/").pop() || filePath;

    let decodedName = rawName;
    try {
        decodedName = decodeURIComponent(rawName);
    } catch (_) {}

    // format lama uploadMiddleware: 1-1774635291496.pdf
    let cleaned = decodedName.replace(/^\d+-\d{10,}(?=\.)/, "");

    // fallback format timestamp lama lain
    cleaned = cleaned.replace(/^\d{10,}-/, "");

    // format baru: Nama_File-985283c9.docx
    const extMatch = cleaned.match(/(\.[^.]+)$/);
    const ext = extMatch ? extMatch[1] : "";
    const base = ext ? cleaned.slice(0, -ext.length) : cleaned;
    const withoutUuid = base.replace(/-[a-f0-9]{8}$/i, "");

    return `${withoutUuid || "tugas"}${ext}`;
}

function getTaskAttachmentDisplayName(task) {
    if (!task || !task.attachment_url) return "tugas";
    return getCleanFileName(task.attachment_url);
}

//helper download filename
function sanitizeFilename(name) {
    return String(name || 'tugas')
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .trim() || 'tugas';
}

function inferFileExtension(task, contentType = '') {
    const attachmentUrl = task?.attachment_url || '';
    const fileNameFromUrl = attachmentUrl.split('/').pop()?.split('?')[0] || '';
    const extFromUrl = fileNameFromUrl.includes('.')
        ? fileNameFromUrl.substring(fileNameFromUrl.lastIndexOf('.'))
        : '';

    if (extFromUrl) return extFromUrl;

    const mime = String(contentType || '').toLowerCase();
    if (mime.includes('pdf')) return '.pdf';
    if (mime.includes('wordprocessingml') || mime.includes('msword')) return '.docx';
    if (mime.includes('presentationml') || mime.includes('powerpoint')) return '.pptx';
    if (mime.includes('spreadsheetml') || mime.includes('excel')) return '.xlsx';
    if (mime.includes('zip')) return '.zip';
    if (mime.includes('rar')) return '.rar';
    if (mime.includes('image/png')) return '.png';
    if (mime.includes('image/jpeg') || mime.includes('image/jpg')) return '.jpg';
    return '';
}

function createDownloadFilename(task, contentType = '') {
    const cleanAttachmentName = getTaskAttachmentDisplayName(task);

    // kalau attachment_url tersedia, prioritaskan nama file asli yang sudah dirapikan
    if (cleanAttachmentName && cleanAttachmentName !== "tugas") {
        const ext = cleanAttachmentName.includes(".")
            ? cleanAttachmentName.substring(cleanAttachmentName.lastIndexOf("."))
            : inferFileExtension(task, contentType);

        const base = cleanAttachmentName.includes(".")
            ? cleanAttachmentName.substring(0, cleanAttachmentName.lastIndexOf("."))
            : cleanAttachmentName;

        const safeBase = sanitizeFilename(base);
        return `${safeBase}${ext}`;
    }

    // fallback kalau attachment_url kosong / tidak valid
    const safeTitle = sanitizeFilename(task?.task_title || `tugas_${task?.id || 'file'}`);
    const extension = inferFileExtension(task, contentType);
    return `${safeTitle}${extension}`;
}

//helper loading button
function setButtonBusy(button, isBusy, busyLabel = 'Memproses...') {
    if (!button) return;

    if (isBusy) {
        button.dataset.originalHtml = button.innerHTML;
        button.dataset.originalDisabled = button.hasAttribute('disabled') ? 'true' : 'false';
        button.disabled = true;
        button.classList.add('is-loading');
        button.innerHTML = `
            <p>
                <span class="material-symbols-outlined spin">progress_activity</span>
                ${busyLabel}
            </p>
        `;
        return;
    }

    if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        delete button.dataset.originalHtml;
    }

    button.classList.remove('is-loading');
    const wasOriginallyDisabled = button.dataset.originalDisabled === 'true';
    if (!wasOriginallyDisabled) {
        button.disabled = false;
    }
    delete button.dataset.originalDisabled;
}

function triggerBrowserDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

function formatDeadlineParts(task) { // ✅ Parameter task, bukan hanya deadline
    if (!task || !task.deadline) return { date: '-', time: '-', isPast: false };
    
    const deadline = new Date(task.deadline);
    const now = new Date();
    
    // Cek apakah deadline sudah lewat > 1 hari (24 jam)
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const isPastOneDay = deadline < oneDayAgo;
    
    // Format date: DD/MM/YYYY
    const formattedDate = deadline.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    });
    
    // Status untuk time element
    let timeStatus = "";
    const isPastDeadline = deadline < now;
    if (task.status === "sudah dikumpulkan") {
        timeStatus = "(dikumpul tepat waktu)"; // ✅ Kondisi yang diinginkan
    } else if (task.status === "belum dikumpulkan" && isPastDeadline) {
        timeStatus = "(sudah berakhir)";
    }
    
    // Format time: HH:MM
    const formattedTime = deadline.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    return {
        date: formattedDate,
        time: formattedTime,
        timeStatus: timeStatus, // ✅ Status untuk ditampilkan di time
        isPast: deadline < now,
        isPastOneDay: isPastOneDay,
        deadlineMerged: `${formattedDate} ${timeStatus}`.trim()
    };
}

// Render daftar tugas dengan filter dan search
function renderTugasMahasiswa(tasks) {
    const container = document.querySelector('.container-list-tugas');
    if (!container) return;

    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<p>Tidak ada tugas</p>';
        return;
    }

    container.innerHTML = tasks.map(task => {
        const deadlineParts = formatDeadlineParts(task);
        const downloadState = getDownloadButtonState(task);
        const uploadState = getUploadButtonState(task);

        return `
        <div class="card-tugas-mhs" data-task-id="${task.id}">
            <div class="wrapper-card">
                <p class="icon-tugas-mhs">
                    <span class="material-symbols-outlined">task</span>
                </p>
                <div class="info-tugas-mhs">
                    <h3 class="judul-tugas-mhs">${escapeHtml(task.task_title)}</h3>
                    <p class="deskripsi-tugas-mhs">${escapeHtml(task.instructions)}</p>
                    <div class="meta-tugas-mhs">
                        <p class="jenis-tugas-mhs">${task.module_id ? 'Module ' + task.module_id : 'Tanpa Modul'}</p>

                        <p class="waktu-pengumpulan-tugas-mhs">
                            <span class="material-symbols-outlined">calendar_today</span>
                            <span class="deadline-date">${deadlineParts.date}</span>
                        </p>

                        <p class="waktu-pengumpulan-tugas-mhs">
                            <span class="material-symbols-outlined">schedule</span>
                            <span class="deadline-time">${deadlineParts.time} WIT ${deadlineParts.timeStatus}</span>
                        </p>

                        <p class="status-tugas-mhs ${task.status === 'sudah dikumpulkan' ? 'dikumpulkan' : 'belumdikumpulkan'}">
                            ${task.status === 'sudah dikumpulkan' ? 'Dikumpulkan' : 'Belum Dikumpulkan'}
                        </p>
                    </div>
                </div>
            </div>
            <div class="action-tugas-mhs">
                <button
                    type="button"
                    class="${downloadState.className}"
                    ${downloadState.disabledAttr}
                    data-task-id="${task.id}"
                    title="${escapeHtml(downloadState.title)}"
                >
                    <p>
                        <span class="material-symbols-outlined">download</span>
                        ${downloadState.label}
                    </p>
                </button>

                <button
                    type="button"
                    class="${uploadState.className}"
                    ${uploadState.disabledAttr}
                    data-task-id="${task.id}"
                    title="${escapeHtml(uploadState.title)}"
                >
                    <p>
                        <span class="material-symbols-outlined">upload</span>
                        Upload
                    </p>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Filter dan search tugas
function applyFilterAndSearch() {
    filteredTasks = allTasks.filter(task => {

        // Filter status
        if (currentFilter === "Belum Dikumpulkan" && task.status !== "belum dikumpulkan") return false;
        if (currentFilter === "Sudah Dikumpulkan" && task.status !== "sudah dikumpulkan") return false;
        // Search judul
        if (currentSearch && !task.task_title.toLowerCase().includes(currentSearch.toLowerCase())) return false;
        return true;
    });
    renderTugasMahasiswa(filteredTasks);
}

// Load tugas dari API
async function loadTugasMahasiswa() {
    try {
        allTasks = await getTaskForMahasiswaRequest(token);
        applyFilterAndSearch();
    } catch (err) {
        alert("Gagal memuat tugas");
    }
}

// Event filter status
function setupFilterButtons() {
    if (isFilterBound) return;

    const filterContainer = document.querySelector('.container-filter-tugas-mhs');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', function (e) {
        const button = e.target.closest('button');
        if (!button) return;

        filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.textContent.trim();
        applyFilterAndSearch();
    });

    isFilterBound = true;
}

// Event search judul
function setupSearchInput() {
    if (isSearchBound) return;

    const searchInput = document.getElementById('searchMahasiswa');
    if (!searchInput) return;

    searchInput.addEventListener('input', function (e) {
        currentSearch = e.target.value.trim();
        applyFilterAndSearch();
    });

    isSearchBound = true;
}

// Modal upload tugas
function showUploadTugasModal(task) {
    if (!task) return;

    Modal.show({
        title: 'Kumpulkan Tugas',
        size: 'large',
        content: `
            <form id="formUploadTugas" class="modal-form" data-task-id="${task.id}">
                <div class="modal-form-group desc">
                    <h3>${escapeHtml(task.task_title)}</h3>
                    <p>Deadline: ${formatDeadlineDisplay(task.deadline)}</p>
                </div>

                <div class="modal-form-group">
                    <label>Upload Tugas</label>
                    <div class="input-file-wrapper" onclick="document.getElementById('lampiran').click()">
                        <span class="material-symbols-outlined upload-icon">upload</span>
                        <span class="file-label">Klik untuk memilih file</span>
                        <span class="file-types">PDF, DOC, DOCX, PPT, ZIP</span>
                        <span class="file-name" id="fileName"></span>
                    </div>
                    <input
                        type="file"
                        name="lampiran"
                        id="lampiran"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                        style="display:none;"
                    >
                </div>

                <div class="modal-form-group">
                    <label>Catatan (opsional)</label>
                    <textarea name="catatan"></textarea>
                </div>

                <button type="submit" class="modal-submit-btn">Kirim Tugas</button>
            </form>
        `
    });

    setTimeout(() => {
        const lampiranInput = document.getElementById('lampiran');
        const fileNameSpan = document.getElementById('fileName');

        if (lampiranInput && fileNameSpan) {
            lampiranInput.addEventListener('change', function (e) {
                fileNameSpan.textContent = e.target.files[0] ? e.target.files[0].name : '';
            });
        }
    }, 0);
}

//handler download aman
async function handleDownloadTask(taskId, button) {
    const task = getTaskById(taskId);
    if (!task) {
        alert('Tugas tidak ditemukan');
        return;
    }

    if (shouldDisableDownload(task)) {
        return;
    }

    if (activeDownloads.has(String(taskId))) {
        return;
    }

    activeDownloads.add(String(taskId));
    setButtonBusy(button, true, 'Mengunduh...');

    try {
        const result = await downloadTaskFileRequest(taskId, token);

        if (!result || !result.blob) {
            throw new Error('File tidak tersedia');
        }

        const filename = createDownloadFilename(task, result.contentType);
        triggerBrowserDownload(result.blob, filename);
    } catch (err) {
        console.error('[handleDownloadTask] Error:', err);
        alert(err.message || 'Gagal download file tugas');
    } finally {
        activeDownloads.delete(String(taskId));
        setButtonBusy(button, false);
    }
}

//handler buka modal upload
function handleOpenUpload(taskId, button) {
    const task = getTaskById(taskId);
    if (!task) {
        alert('Tugas tidak ditemukan');
        return;
    }

    if (shouldDisableUpload(task) || activeUploads.has(String(taskId))) {
        return;
    }

    showUploadTugasModal(task);
}

//handler untuk proses upload anti double upload
async function handleSubmitUpload(form) {
    const taskId = form.dataset.taskId;
    const task = getTaskById(taskId);

    if (!task) {
        Modal.alert('Tugas tidak ditemukan.');
        return;
    }

    if (activeUploads.has(String(taskId))) {
        return;
    }

    const submitButton = form.querySelector('.modal-submit-btn');
    const formData = new FormData(form);
    const answerText = formData.get('catatan');
    const file = formData.get('lampiran');

    activeUploads.add(String(taskId));
    setButtonBusy(submitButton, true, 'Mengirim...');

    try {
        await submitWritingRequest(taskId, answerText, file, token);
        Modal.alert('Tugas berhasil dikumpulkan!');
        await loadTugasMahasiswa();
    } catch (err) {
        console.error('[handleSubmitUpload] Error:', err);
        Modal.alert(err?.message || 'Gagal mengumpulkan tugas.');
    } finally {
        activeUploads.delete(String(taskId));
        setButtonBusy(submitButton, false);
    }
}

// Event delegation untuk download dan upload
function setupEventDelegation() {
    if (isDelegationBound) return;

    document.addEventListener('click', async function (e) {
        const downloadBtn = e.target.closest('.download-soal-tugas');
        if (downloadBtn) {
            e.preventDefault();

            if (downloadBtn.disabled || downloadBtn.classList.contains('disabled')) return;

            const taskId = downloadBtn.dataset.taskId || downloadBtn.closest('.card-tugas-mhs')?.dataset.taskId;
            if (!taskId) return;

            await handleDownloadTask(taskId, downloadBtn);
            return;
        }

        const uploadBtn = e.target.closest('.upload-tugas');
        if (uploadBtn) {
            e.preventDefault();

            if (uploadBtn.disabled || uploadBtn.classList.contains('terlambat')) return;

            const taskId = uploadBtn.dataset.taskId || uploadBtn.closest('.card-tugas-mhs')?.dataset.taskId;
            if (!taskId) return;

            handleOpenUpload(taskId, uploadBtn);
            return;
        }

        const filterBtn = e.target.closest('.container-filter-tugas-mhs button');
        if (filterBtn) {
            e.preventDefault();

            const filterContainer = filterBtn.closest('.container-filter-tugas-mhs');
            if (!filterContainer) return;

            filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            filterBtn.classList.add('active');

            currentFilter = filterBtn.textContent.trim();
            applyFilterAndSearch();
            return;
        }
    });

    document.addEventListener('input', function (e) {
        const searchInput = e.target.closest('#searchMahasiswa');
        if (!searchInput) return;

        currentSearch = searchInput.value.trim();
        applyFilterAndSearch();
    });

    document.addEventListener('submit', async function (e) {
        if (e.target && e.target.id === 'formUploadTugas') {
            e.preventDefault();
            await handleSubmitUpload(e.target);
        }
    });

    isDelegationBound = true;
}

// Hitung selisih waktu sampai deadline; kembalikan null jika sudah lewat
function timeUntil(deadline) {
    if (!deadline) return null;
    const now = new Date();
    const d = new Date(deadline);
    const diffMs = d - now;
    if (diffMs <= 0) return null; // sudah lewat

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) {
        const diffMinutes = Math.ceil(diffMs / (1000 * 60));
        return { type: 'minutes', value: diffMinutes, label: `sisa ${diffMinutes} menit lagi` };
    } else if (diffHours < 24) {
        const hours = Math.ceil(diffHours);
        return { type: 'hours', value: hours, label: `sisa ${hours} jam lagi` };
    } else {
        const days = Math.ceil(diffDays);
        return { type: 'days', value: days, label: `sisa ${days} hari lagi` };
    }
}

// Render deadline cards khusus beranda — hanya tugas yang belum dikumpulkan dan deadline belum lewat
async function fetchAndRenderDeadlineCards(token, targetSelector = ".wrapper-card-deadline-mhs", limit = 4) {
    const container = document.querySelector(targetSelector);
    if (!container) return;
    try {
        const tasks = await getTaskForMahasiswaRequest(token);
        if (!tasks || tasks.length === 0) {
            container.innerHTML = "<p>Tidak ada tugas</p>";
            return;
        }

        const now = new Date();

        // Filter: punya deadline, deadline masih di masa depan, dan belum dikumpulkan
        const upcoming = tasks
            .filter(t => t.deadline)
            .map(t => ({ ...t, _deadlineDate: new Date(t.deadline) }))
            .filter(t => t._deadlineDate > now && t.status !== "sudah dikumpulkan")
            .sort((a, b) => a._deadlineDate - b._deadlineDate);

        if (upcoming.length === 0) {
            container.innerHTML = "<p>Tidak ada tugas mendekati deadline</p>";
            return;
        }

        const slice = upcoming.slice(0, limit);

        container.innerHTML = slice.map(t => {
            const timeInfo = timeUntil(t.deadline);
            const label = timeInfo ? timeInfo.label : "Sudah berakhir";
            return `
                <div class="card-deadline-mhs">
                    <p class="icon-deadline">
                        <span class="material-symbols-outlined">assignment</span>
                    </p>
                    <div class="wrapper-info-card-deadline">
                        <h2>${escapeHtml(t.task_title)}</h2>
                        <p>${label}</p>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Gagal fetch tasks for beranda:", err);
        container.innerHTML = "<p>Tidak bisa memuat tugas</p>";
    }
}

// Render jumlah tugas: "submitted/total" ke element H2 di beranda
async function fetchAndRenderTaskSummary(token, targetSelector = '.card-beranda-wrapper .card-beranda:nth-child(4) .info-card-wrapper h2') {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    try {
        const tasks = await getTaskForMahasiswaRequest(token);
        const total = Array.isArray(tasks) ? tasks.length : 0;
        const submitted = Array.isArray(tasks) ? tasks.filter(t => t.status === "sudah dikumpulkan").length : 0;
        el.textContent = `${submitted}/${total}`;
    } catch (err) {
        console.error("Gagal fetch task summary:", err);
    }
}

// Render task stats di progress-evaluasi: "submitted/total" ke h2 dan jumlah belum dikumpulkan ke p
async function fetchAndRenderTaskStats(token, targetH2Selector = '.card-monitoring:last-child h2', targetPSelector = '.card-monitoring:last-child p.alert-card') {
    try {
        const tasks = await getTaskForMahasiswaRequest(token);
        
        const total = Array.isArray(tasks) ? tasks.length : 0;
        const submitted = Array.isArray(tasks) ? tasks.filter(t => t.status === "sudah dikumpulkan").length : 0;
        const pending = total - submitted; // Tugas belum dikumpulkan

        // Update h2 dengan format "submitted/total"
        const h2El = document.querySelector(targetH2Selector);
        if (h2El) {
            h2El.textContent = `${submitted}/${total}`;
        }

        // Update p dengan pesan jumlah belum dikumpulkan
        const pEl = document.querySelector(targetPSelector);
        if (pEl) {
            if (pending > 0) {
                pEl.textContent = `${pending} Tugas Belum Dikumpulkan`;
            } else {
                pEl.textContent = "Semua Tugas Sudah Dikumpulkan";
            }
        }

        console.log('[fetchAndRenderTaskStats] Total:', total, 'Submitted:', submitted, 'Pending:', pending);
    } catch (err) {
        console.error('Gagal fetch task stats:', err);
    }
}

// Inisialisasi SPA
function syncTaskPageUIState() {
    const searchInput = document.getElementById('searchMahasiswa');
    if (searchInput) {
        searchInput.value = currentSearch;
    }

    const filterButtons = document.querySelectorAll('.container-filter-tugas-mhs button');
    filterButtons.forEach(btn => {
        const isActive = btn.textContent.trim() === currentFilter;
        btn.classList.toggle('active', isActive);
    });
}

function initManajemenTugasMhs() {
    setupEventDelegation();
    syncTaskPageUIState();
    loadTugasMahasiswa();
}

// Export di akhir file
export {
    initManajemenTugasMhs,
    showUploadTugasModal,
    fetchAndRenderDeadlineCards,
    fetchAndRenderTaskSummary,
    fetchAndRenderTaskStats
};