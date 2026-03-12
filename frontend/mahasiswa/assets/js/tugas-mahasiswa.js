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
    if (task.status === "sudah dikumpulkan" && isPastOneDay) {
        timeStatus = "(sudah berakhir)"; // ✅ Kondisi yang diinginkan
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
    const container = document.querySelector(".container-list-tugas");
    if (!container) return;
    if (!tasks || tasks.length === 0) {
        container.innerHTML = "<p>Tidak ada tugas</p>";
        return;
    }
    
    function shouldDisableUpload(task) {
        // Kondisi 1: Jika status sudah "sudah dikumpulkan"
        if (task.status === "sudah dikumpulkan") {
            return true;
        }
        
        // Kondisi 2: Jika deadline sudah lewat (status belum dikumpulkan)
        if (task.status === "belum dikumpulkan" && task.deadline) {
            const deadlineDate = new Date(task.deadline);
            const now = new Date();
            return deadlineDate < now; // Disable jika deadline sudah lewat
        }
        
        // Kondisi 3: Jika submitted_at melewati deadline
        if (task.submitted_at && task.deadline) {
            const submittedDate = new Date(task.submitted_at);
            const deadlineDate = new Date(task.deadline);
            return submittedDate > deadlineDate;
        }
        
        return false;
    }

    container.innerHTML = tasks.map(task => {
        const isUploadDisabled = shouldDisableUpload(task);
        const deadlineParts = formatDeadlineParts(task);
        const uploadClass = isUploadDisabled ? "upload-tugas terlambat" : "upload-tugas";
        const disabledAttr = isUploadDisabled ? "disabled" : "";
        
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
                        <p class="jenis-tugas-mhs">${task.module_id ? "Module " + task.module_id : "Tanpa Modul"}</p>
                        
                        <!-- Deadline Date -->
                        <p class="waktu-pengumpulan-tugas-mhs">
                            <span class="material-symbols-outlined">calendar_today</span>
                            <span class="deadline-date">${deadlineParts.date}</span>
                        </p>
                        
                        <!-- Deadline Time -->
                        <p class="waktu-pengumpulan-tugas-mhs">
                            <span class="material-symbols-outlined">schedule</span>
                            <span class="deadline-time">${deadlineParts.time} WIT ${deadlineParts.timeStatus}</span>
                        </p>
                        
                        <p class="status-tugas-mhs ${task.status === "sudah dikumpulkan" ? "dikumpulkan" : "belumdikumpulkan"}">
                            ${task.status === "sudah dikumpulkan" ? "Dikumpulkan" : "Belum Dikumpulkan"}
                        </p>
                    </div>
                </div>
            </div>
            <div class="action-tugas-mhs">
                <button class="download-soal-tugas">
                    <p>
                        <span class="material-symbols-outlined">download</span>
                        Download
                    </p>
                </button>
                <button class="${uploadClass}" ${disabledAttr}>
                    <p>
                    <span class="material-symbols-outlined">upload</span>
                    Upload
                    </p>
                </button>
            </div>
        </div>
        `;
    }).join("");
}

// Filter dan search tugas
function applyFilterAndSearch() {
    filteredTasks = allTasks.filter(task => {

        const isNotPastDeadline = task.deadline > now; // deadline masih di masa depan
        // Filter status
        if (currentFilter === "Belum Dikumpulkan" && isNotPastDeadline) return false;
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
    const filterContainer = document.querySelector(".container-filter-tugas-mhs");
    if (!filterContainer) return;
    filterContainer.addEventListener("click", function(e){
        if (e.target.tagName === "BUTTON") {
            // Remove active class
            filterContainer.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            currentFilter = e.target.textContent.trim();
            applyFilterAndSearch();
        }
    });
}

// Event search judul
function setupSearchInput() {
    const searchInput = document.getElementById("searchMahasiswa");
    if (!searchInput) return;
    searchInput.addEventListener("input", function(e){
        currentSearch = e.target.value.trim();
        applyFilterAndSearch();
    });
}

// Modal upload tugas
function showUploadTugasModal(task) {
    Modal.show({
        title: "Kumpulkan Tugas",
        size: "large",
        content: `
            <form id="formUploadTugas" class="modal-form">
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
                    <input type="file" name="lampiran" id="lampiran" 
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" 
                            style="display:none;">
                </div>
                <div class="modal-form-group">
                    <label>Catatan (opsional)</label>
                    <textarea name="catatan"></textarea>
                </div>
                <button type="submit" class="modal-submit-btn">Kirim Tugas</button>
            </form>
        `
    });

    // Event listener untuk preview nama file
    setTimeout(() => {
        const lampiranInput = document.getElementById('lampiran');
        const fileNameSpan = document.getElementById('fileName');
        if (lampiranInput && fileNameSpan) {
            lampiranInput.addEventListener('change', function(e){
                fileNameSpan.textContent = e.target.files[0] ? e.target.files[0].name : '';
            });
        }
    }, 0);
}

// Event delegation untuk download dan upload
function setupEventDelegation() {
    document.addEventListener("click", async function(e){
        // Download file tugas
        if (e.target.closest(".download-soal-tugas")) {
            const card = e.target.closest(".card-tugas-mhs");
            const taskId = card.getAttribute("data-task-id");
            const task = allTasks.find(t => String(t.id) === String(taskId));
            let fileName = "tugas_" + taskId;
            if (task && task.attachment_url) {
                // Ambil ekstensi file dari attachment_url
                const originalFileName = task.attachment_url.split("/").pop();
                const ext = originalFileName.includes('.') ? originalFileName.substring(originalFileName.lastIndexOf('.')) : '';
                // Nama file download: judul_tugas (tanpa karakter aneh) + ekstensi
                fileName = escapeHtml(task.task_title).replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/ /g, "_") + ext;
            }
            try {
                const blob = await downloadTaskFileRequest(taskId, token);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (err) {
                alert("Gagal download file tugas");
            }
        }

        // Upload tugas
        if (e.target.closest(".upload-tugas")) {
            const btn = e.target.closest(".upload-tugas");
            if (btn.hasAttribute && btn.hasAttribute("disabled")) return; // jangan buka modal jika disabled

            const card = btn.closest(".card-tugas-mhs");
            const taskId = card.getAttribute("data-task-id");
            const task = allTasks.find(t => String(t.id) === String(taskId));
            if (task) showUploadTugasModal(task);
        }
    });

    // Submit form modal upload tugas
    document.addEventListener("submit", async function(e) {
        if (e.target && e.target.id === "formUploadTugas") {
            e.preventDefault();
            const formData = new FormData(e.target);
            const answerText = formData.get("catatan");
            const file = formData.get("lampiran");
            const taskId = allTasks.find(t => escapeHtml(t.task_title) === e.target.querySelector("h3").textContent)?.id;
            try {
                await submitWritingRequest(taskId, answerText, file, token);
                Modal.alert("Tugas berhasil dikumpulkan!");
                await loadTugasMahasiswa(); // refresh daftar tugas
            } catch (err) {
                Modal.alert("Gagal mengumpulkan tugas.");
            }
            // Modal.hide();
        }
    });
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
                    <h2>${escapeHtml(t.task_title)}</h2>
                    <p>${label}</p>
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

// Inisialisasi SPA
function initManajemenTugasMhs() {
    loadTugasMahasiswa();
    setupEventDelegation();
    setupFilterButtons();
    setupSearchInput();
}

// Export di akhir file
export {
    initManajemenTugasMhs,
    showUploadTugasModal,
    fetchAndRenderDeadlineCards,
    fetchAndRenderTaskSummary
};