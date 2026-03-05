import Modal from "../../../assets/modal.js";
import { 
    getTaskForDosenRequest, 
    createTaskRequest, 
    updateTaskRequest, 
    deleteTaskRequest,
    getSubmissionsByTaskRequest,
    getModulesRequest,
    downloadSubmissionsZipRequest
} from "../../../assets/api.js";

let allTasks = [];
let allModules = [];
let currentEditTaskId = null;
const token = localStorage.getItem("token");
let dom = {};

// Init dipanggil oleh dashboard SPA
export async function initManajemenTugas() {
    // sesuaikan id search dengan HTML page
    dom.listTugasContainer = document.getElementById("listTugasContainer");
    dom.searchTugasInput = document.getElementById("searchMahasiswa");
    dom.btnBuatTugas = document.getElementById("btnBuatTugas");

    if (!token) return;

    try {
        allModules = (typeof getModulesRequest === "function") ? (await getModulesRequest(token) || []) : [];
    } catch (e) {
        console.warn("load modules failed", e);
    }

    await loadTugas();

    // Event delegation untuk tombol di list tugas
    if (dom.listTugasContainer) {
        dom.listTugasContainer.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            const taskId = btn.dataset.taskId;
            if (btn.classList.contains("btnLihatSubmisi")) {
                e.preventDefault();
                handleViewSubmissions(taskId);
            } else if (btn.classList.contains("btnEditTugas")) {
                e.preventDefault();
                const task = allTasks.find(t => String(t.id) === String(taskId));
                if (task) openEditModalWithData(task);
            } else if (btn.classList.contains("btnHapusTugas")) {
                e.preventDefault();
                handleDeleteTugas(taskId);
            }
        });
    }

    // Global submit listener untuk form modal
    document.addEventListener("submit", async (e) => {
        if (e.target && e.target.id === "formTugas") {
            e.preventDefault();
            await handleFormSubmit(e.target);
        }
    });

    if (dom.searchTugasInput) dom.searchTugasInput.addEventListener("input", handleSearch);
}

// LOAD
async function loadTugas() {
    const container = dom.listTugasContainer;
    if (!container) return;
    try {
        const data = await getTaskForDosenRequest(token);
        allTasks = Array.isArray(data) ? data : [];
        renderTugas(allTasks, container);
    } catch (err) {
        console.error("Error load tugas:", err);
        container.innerHTML = '<p style="text-align:center;padding:20px;">Gagal memuat tugas</p>';
    }
}

// render tugas
function renderTugas(tasks, container) {
    if (!container) return;
    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;">Tidak ada tugas</p>';
        return;
    }
    container.innerHTML = tasks.map(task => {
        const deadline = formatDeadlineDisplay(task.deadline);
        const filename = task.attachment_url ? task.attachment_url.split("/").pop() : "-";
        const moduleName = task.module_title || (task.module_id ? `Module ${task.module_id}` : "Tanpa Modul");
        return `
        <div class="card-tugas-dosen" data-task-id="${task.id}">
            <div class="wrapper-card">
                <p class="icon-tugas-dosen"><span class="material-symbols-outlined">task</span></p>
                <div class="info-tugas-dosen">
                    <h3 class="judul-tugas-dosen">${escapeHtml(task.task_title || "Tanpa Judul")}</h3>
                    <p class="deskripsi-tugas-dosen">${escapeHtml(task.instructions || "-")}</p>
                    <div class="meta-tugas-dosen">
                        <p class="jenis-tugas-dosen">${escapeHtml(moduleName)}</p>
                        <p class="waktu-pengumpulan-tugas-dosen"><span class="material-symbols-outlined">calendar_today</span> ${deadline}</p>
                        <p class="dokumen-tugas-dosen"><span class="material-symbols-outlined">description</span> ${escapeHtml(filename)}</p>
                    </div>
                </div>
            </div>
            <div class="action-tugas-dosen">
                <button id="btnLihatSubmisi" class="btn-kumpul btnLihatSubmisi" data-task-id="${task.id}">
                    <p><span class="material-symbols-outlined">visibility</span></p>
                </button>
                <button id="btnEditTugas" class="btn-edit btnEditTugas" data-task-id="${task.id}">
                    <p><span class="material-symbols-outlined">edit</span></p>
                </button>
                <button class="btn-hapus btnHapusTugas" data-task-id="${task.id}">
                    <p><span class="material-symbols-outlined">delete</span></p>
                </button>
            </div>
        </div>`;
    }).join("");
}

// helper
function escapeHtml(s){ 
    if(!s) return ""; 
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); 
}

// helper deadline
function formatDeadlineDisplay(deadline){
    if(!deadline) return "-";
    const d = parseDbDatetimeToDate(String(deadline));
    if(!d) return "-";
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// helper: parse DB datetime (WIB) -> Date
function parseDbDatetimeToDate(dbString){
    if(!dbString) return null;
    const parts = dbString.split(' ');
    if(parts.length < 2) return null;
    const [y, m, d] = parts[0].split('-').map(Number);
    const [hh, mm, ss] = parts[1].split(':').map(Number);
    const wibDate = new Date(y, m-1, d, hh, mm, ss || 0);
    wibDate.setHours(wibDate.getHours() + 2);
    return wibDate;
}

// helper submitted_at WIB -> WIT
function formatSubmittedAtToWIT_fromDb(dbString){
    const dt = parseDbDatetimeToDate(dbString);
    if(!dt) return {date: "-", time: "-"};
    const dd = String(dt.getDate()).padStart(2,"0");
    const mm = String(dt.getMonth()+1).padStart(2,"0");
    const yyyy = dt.getFullYear();
    const hh = String(dt.getHours()).padStart(2,"0");
    const min = String(dt.getMinutes()).padStart(2,"0");
    return { date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${min} WIT` };
}

// helper: render module select options
function buildModuleSelectMarkup(selectedId = null){
    const options = allModules.length > 0 
        ? allModules.map(m => `<option value="${m.id}" ${m.id == selectedId ? 'selected' : ''}>${escapeHtml(m.title || m.name || `Module ${m.id}`)}</option>`).join("")
        : `<option value="">Tidak ada module</option>`;
    
    // tambah empty option di awal
    return `<option value="">-- Pilih Module (Opsional) --</option>${options}`;
}

// MODAL: Buat Tugas Baru
function showCreateTaskModal(){
    currentEditTaskId = null;
    const content = `
        <form id="formTugas" class="modal-form" enctype="multipart/form-data">
            <input type="hidden" name="task_id" value="">
            <div class="modal-form-group">
                <label>Judul Tugas</label>
                <input type="text" name="task_title" required>
            </div>

            <div class="modal-form-group">
                <label>Deskripsi</label>
                <textarea name="instructions" required></textarea>
            </div>

            <div class="modal-form-group">
                <label>Sintaks / Module</label>
                <select name="module_id">
                    ${buildModuleSelectMarkup()}
                </select>
            </div>

            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label>Tanggal Deadline</label>
                    <input type="date" name="deadline_date" required>
                </div>
                <div class="modal-form-group">
                    <label>Waktu Deadline</label>
                    <input type="time" name="deadline_time" required>
                </div>
            </div>

            <div class="modal-form-group">
                <label>Lampiran (opsional)</label>
                <div class="input-file-wrapper" onclick="document.getElementById('attachment').click()">
                    <span class="material-symbols-outlined upload-icon">upload</span>
                    <span class="file-label">Klik untuk memilih file</span>
                    <span class="file-types">PDF, DOC, DOCX, PPT, ZIP</span>
                    <span class="file-name" id="fileName"></span>
                </div>
                <input type="file" name="attachment" id="attachment" 
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" 
                        style="display:none;">
            </div>

            <button type="submit" class="modal-submit-btn">Buat Tugas</button>
        </form>
    `;
    Modal.show({ title: "Buat Tugas Baru", size: "large", content });

        // Tambahkan event listener setelah modal muncul
    setTimeout(() => {
        const attachmentInput = document.getElementById('attachment');
        const fileNameSpan = document.getElementById('fileName');
        if (attachmentInput && fileNameSpan) {
            attachmentInput.addEventListener('change', function(e){
                fileNameSpan.textContent = e.target.files[0] ? e.target.files[0].name : '';
            });
        }
    }, 0);
}

// MODAL: Edit Tugas
function openEditModalWithData(task){
    currentEditTaskId = task.id;
    let dateValue = "";
    let timeValue = "";
    if (task.deadline) {
        const parts = String(task.deadline).split(' ');
                if (parts.length === 2) {
                    dateValue = parts[0]; // "YYYY-MM-DD"
                    timeValue = parts[1].slice(0,5); // "HH:mm"
                }
    }

    const content = `
        <form id="formTugas" class="modal-form" enctype="multipart/form-data">
            <input type="hidden" name="task_id" value="${escapeHtml(String(task.id))}">
            <div class="modal-form-group">
                <label>Judul Tugas</label>
                <input type="text" name="task_title" required value="${escapeHtml(task.task_title || "")}">
            </div>

            <div class="modal-form-group">
                <label>Deskripsi</label>
                <textarea name="instructions" required>${escapeHtml(task.instructions || "")}</textarea>
            </div>


            <div class="modal-form-group">
                <label>Sintaks / Module</label>
                <select name="module_id">
                    ${buildModuleSelectMarkup()}
                </select>
            </div>

            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label>Tanggal Deadline</label>
                    <input type="date" name="deadline_date" required value="${escapeHtml(dateValue)}">
                </div>
                <div class="modal-form-group">
                    <label>Waktu Deadline</label>
                    <input type="time" name="deadline_time" required value="${escapeHtml(timeValue)}">
                </div>
            </div>

            <div class="modal-form-group">
                <label>Lampiran (opsional)</label>
                <div class="input-file-wrapper" onclick="document.getElementById('attachment').click()">
                    <span class="material-symbols-outlined upload-icon">upload</span>
                    <span class="file-label">Klik untuk memilih file</span>
                    <span class="file-types">PDF, DOC, DOCX, PPT, ZIP</span>
                    <span class="file-name" id="fileName">${task.attachment_url ? escapeHtml(task.attachment_url.split("/").pop()) : ""}</span>
                </div>
                <input type="file" name="attachment" id="attachment" 
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" 
                        style="display:none;">
            </div>

            <button type="submit" class="modal-submit-btn">Simpan Perubahan</button>
        </form>
    `;
    Modal.show({ title: "Edit Tugas", size: "large", content });

        // Tambahkan event listener setelah modal muncul
    setTimeout(() => {
        const attachmentInput = document.getElementById('attachment');
        const fileNameSpan = document.getElementById('fileName');
        if (attachmentInput && fileNameSpan) {
            attachmentInput.addEventListener('change', function(e){
                fileNameSpan.textContent = e.target.files[0] ? e.target.files[0].name : '';
            });
        }
    }, 0);
}

// Handle form submit (create/update)
async function handleFormSubmit(form){
    const formData = new FormData(form);
    const taskId = formData.get("task_id");
    const taskTitle = formData.get("task_title") || "";
    const instructions = formData.get("instructions") || "";
    const moduleId = formData.get("module_id") || "";

    // Ambil deadline dari dua input
    const deadlineDate = formData.get("deadline_date") || "";
    const deadlineTime = formData.get("deadline_time") || "";
    let deadline = "";
    if (deadlineDate && deadlineTime) {
        deadline = `${deadlineDate} ${deadlineTime}:00`;
    }

    const attachmentFile = formData.get("attachment") || null;

    try {
        if (taskId) {
            // update
            await updateTaskRequest(taskId, moduleId, taskTitle, instructions, attachmentFile, deadline, token);
            alert("Tugas berhasil diperbarui");
        } else {
            // create
            await createTaskRequest(moduleId, taskTitle, instructions, attachmentFile, deadline, token);
            alert("Tugas berhasil dibuat");
        }
        currentEditTaskId = null;
        await loadTugas();
        Modal.hide();
    } catch (err) {
        console.error("Gagal submit tugas:", err);
        alert("Gagal menyimpan tugas");
    }
}

// delete
async function handleDeleteTugas(id){
    if (!confirm("Hapus tugas?")) return;
    try {
        await deleteTaskRequest(id, token);
        alert("Tugas dihapus");
        await loadTugas();
    } catch (err){
        console.error(err);
        alert("Gagal menghapus tugas");
    }
}

// view submissions
async function handleViewSubmissions(taskId){
    try {
        const submissions = await getSubmissionsByTaskRequest(taskId, token);
        const content = submissions && submissions.length ? submissions.map(sub => {
            const submittedAt = sub.submitted_at || "-";
            const [date, time] = submittedAt.split(" ");
            return `
            <div class="submission-card">
                <div class="submission-header">
                    <div>
                        <div class="submission-name">${escapeHtml(sub.student_name || ("Student " + sub.student_npm))}</div>
                        <div class="submission-npm">NPM : ${escapeHtml(String(sub.student_npm))}</div>
                    </div>
                    <div class="submission-date">
                        <div class="submission-date-day">${date || "-"}</div>
                        <div class="submission-time">${time ? time.slice(0,5) : "-"}</div>
                    </div>
                </div>
                <div class="submission-file">
                    ${ sub.file_url ? `<a class="file-mhs" href="${sub.file_url}" target="_blank">
                        <span class="material-symbols-outlined">description</span>
                        ${escapeHtml(sub.file_url.split("/").pop())}
                    </a>` : "-" }
                </div>
                ${sub.answer_text ? `<div class="submission-answer"><strong>Catatan:</strong><p>${escapeHtml(sub.answer_text)}</p></div>` : ""}
                ${ sub.score !== null && sub.score !== undefined ? `<p><strong>Nilai:</strong> ${escapeHtml(String(sub.score))}</p>` : "" }
                ${ sub.feedback ? `<p><strong>Feedback:</strong> ${escapeHtml(sub.feedback)}</p>` : "" }
            </div>`;
        }).join("") : `<p style="padding:16px">Tidak ada pengumpulan tugas</p>`;

        Modal.show({
            title: `Submisi Tugas #${taskId}`,
            size: "medium",
            content: `<div class="submission-card-wrapper">${content}</div>
                      <button type="button" class="modal-download-btn" id="downloadZip">Download ZIP</button>`
        });

        setTimeout(() => {
            const downloadBtn = document.getElementById("downloadZip");
            if (downloadBtn) {
                downloadBtn.addEventListener("click", async function(){
                    try {
                        // Gunakan fungsi API yang sudah ada
                        const blob = await downloadSubmissionsZipRequest(taskId, token);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `submissions_task_${taskId}.zip`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    } catch (err) {
                        alert("Gagal download ZIP");
                    }
                });
            }
        }, 0);
        
    } catch (err) {
        console.error("Gagal ambil submissions", err);
        alert("Gagal memuat pengumpulan tugas");
    }
}

// search filter
function handleSearch(e){
    const q = (e.target.value || "").toLowerCase();
    const filtered = allTasks.filter(t => (t.task_title||"").toLowerCase().includes(q));
    renderTugas(filtered, dom.listTugasContainer);
}

// expose
window.initManajemenTugas = initManajemenTugas;
window.showCreateTaskModal = showCreateTaskModal;