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

// Render daftar tugas dengan filter dan search
function renderTugasMahasiswa(tasks) {
    const container = document.querySelector(".container-list-tugas");
    if (!container) return;
    if (!tasks || tasks.length === 0) {
        container.innerHTML = "<p>Tidak ada tugas</p>";
        return;
    }
    container.innerHTML = tasks.map(task => `
        <div class="card-tugas-mhs" data-task-id="${task.id}">
            <div class="wrapper-card">
                <p class="icon-tugas-mhs">
                    <span class="material-symbols-outlined">task</span>
                </p>
                <div class="info-tugas-mhs">
                    <h3 class="judul-tugas-mhs">${escapeHtml(task.task_title)}</h3>
                    <p class="deskripsi-tugas-mhs">${escapeHtml(task.instructions)}</p>
                    <div class="meta-tugas-mhs">
                        <p class="jenis-tugas-mhs">${task.module_id ? "Module " + task.module_id : "-"}</p>
                        <p class="waktu-pengumpulan-tugas-mhs">
                            <span class="material-symbols-outlined">calendar_today</span>
                            ${formatDeadlineDisplay(task.deadline)}
                        </p>
                        <p class="dokumen-tugas-mhs">
                            <span class="material-symbols-outlined">description</span>
                            ${task.attachment_url ? escapeHtml(task.attachment_url.split("/").pop()) : "-"}
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
                <button class="upload-tugas" ${task.status === "sudah dikumpulkan" ? "disabled" : ""}>
                    <p>
                        <span class="material-symbols-outlined">upload</span>
                        Upload
                    </p>
                </button>
            </div>
        </div>
    `).join("");
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
            const card = e.target.closest(".card-tugas-mhs");
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
            Modal.hide();
        }
    });
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
    showUploadTugasModal
};