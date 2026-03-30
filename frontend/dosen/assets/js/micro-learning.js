import { createModuleRequest, uploadFileResourceRequest, getModuleListRequest, updateModuleRequest, deleteModuleRequest, getCompleteStudentByModuleIdRequest, getModuleById } from "../../../assets/api.js";
import Modal from "../../../assets/modal.js";
import Toast from "../../../assets/toast.js";
console.log("micro-learning.js loaded");

// ============================================
// HELPER: Generate Edit Module Form
// ============================================
function generateEditModuleForm(modul) {
    // Parse steps jika modul.steps ada
    const steps = modul.steps || [];
    const step1 = steps.find(s => s.step_number === 1) || {};
    const step2 = steps.find(s => s.step_number === 2) || {};
    const step3 = steps.find(s => s.step_number === 3) || {};

    const step1Resources = step1.resources || [];
    const step2Resources = step2.resources || [];
    const step3Resources = step3.resources || [];

    const videoLink = step1Resources.find(r => r.type === "video_link")?.value || "";
    const pptFile = step2Resources.find(r => r.type === "ppt")?.value || "";

    const objectives = modul.objectives || [];
    const objectivesHtml = objectives.map((obj, idx) => `
        <div class="tujuan-item">
            <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran ${idx + 1}" value="${obj}">
            ${idx >= 3 ? '<button type="button" class="hapus-tujuan"><span class="material-symbols-outlined">delete</span></button>' : ''}
        </div>
    `).join("");

    return `
        <form id="formEditModul" class="modal-form">
            <!-- JUDUL -->
            <div class="modal-form-group">
                <label>Judul Modul</label>
                <input type="text" name="judul_modul" value="${modul.title || ''}" required>
            </div>

            <!-- DESKRIPSI -->
            <div class="modal-form-group">
                <label>Deskripsi Modul</label>
                <textarea name="deskripsi_modul" rows="3">${modul.description || ''}</textarea>
            </div>

            <!-- TUJUAN -->
            <div class="modal-form-group">
                <label>Tujuan Pembelajaran</label>
                <div id="tujuanContainer">
                    ${objectivesHtml || `
                        <div class="tujuan-item">
                            <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran 1">
                        </div>
                        <div class="tujuan-item">
                            <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran 2">
                        </div>
                        <div class="tujuan-item">
                            <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran 3">
                        </div>
                    `}
                </div>
                <button type="button" id="btnTambahTujuan" class="btn-tambah-tujuan">
                    <span class="material-symbols-outlined">add</span>
                    Tambah Tujuan
                </button>
            </div>

            <!-- ================= PENGATURAN MODUL ================= -->
            <div class="step-modul">
                <h3>Pengaturan Modul</h3>
                <div class="modal-form-group">
                    <label>Fitur Modul</label>
                    <label class="diskusi-card">
                        <input type="checkbox" name="gunakan_forum" id="gunakanForum" ${modul.discussion_enabled ? 'checked' : ''}>
                        <div class="diskusi-card-content">
                            <span class="material-symbols-outlined icon-diskusi">forum</span>
                            <div class="diskusi-info">
                                <h4>Aktifkan Forum Diskusi</h4>
                                <p>Mahasiswa dapat berdiskusi pada modul ini</p>
                            </div>
                            <span class="material-symbols-outlined check-icon">check_circle</span>
                        </div>
                    </label>
                </div>
            </div>
            
            <!-- ================= STEP 1 ================= -->
            <div class="step-modul">
                <h3>STEP 1 — Microlearning</h3>
                <div class="modal-form-group">
                    <label>Link Video Microlearning (±5 menit)</label>
                    <input type="url" name="video_microlearning" placeholder="https://youtube.com/..." value="${videoLink}">
                </div>
                <div class="modal-form-group">
                    <label>Dokumen Contoh Penelitian</label>
                    
                    <label class="input-file-wrapper">

                        <span class="material-symbols-outlined upload-icon">
                            upload
                        </span>

                        <span class="file-label">Klik untuk memilih file</span>
                        <span class="file-types">PDF, DOC, DOCX, PPT DLL</span>

                        <span class="file-name" id="fileNameDokumen"></span>

                        <input type="file" name="dokumen_penelitian" hidden>

                    </label>
                    <small class="file-saat-ini">File saat ini: ${step1Resources.find(r => r.type === "document")?.value || 'Belum ada'}</small>
                </div>
            </div>

            <!-- ================= STEP 2 ================= -->
            <div class="step-modul">
                <h3>STEP 2 — Materi Utama</h3>
                <div class="modal-form-group">
                    <label>Upload File PPT</label>

                    <label class="input-file-wrapper">
                        <span class="material-symbols-outlined upload-icon">upload</span>
                        <span class="file-label">Klik untuk memilih file</span>
                        <span class="file-types">PPT, PPTX, PDF</span>
                        <span class="file-name"></span>

                        <input type="file" name="file_ppt" hidden>
                    </label>
                    <small class="file-saat-ini">File saat ini: ${pptFile || 'Belum ada'}</small>
                </div>
                <div class="modal-form-group">
                    <label class="diskusi-card">
                        <input type="checkbox" name="diskusi_rangkuman" ${step2.discussion_enabled ? 'checked' : ''}>
                        <div class="diskusi-card-content">
                            <span class="material-symbols-outlined icon-diskusi">forum</span>
                            <div class="diskusi-info">
                                <h4>Catat Poin Penting</h4>
                                <p>Buat rangkuman atau poin penting dari materi PPT</p>
                            </div>
                            <span class="material-symbols-outlined check-icon">check_circle</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- ================= STEP 3 ================= -->
            <div class="step-modul">
                <h3>STEP 3 — Infografis Analisis</h3>
                <div class="modal-form-group">
                    <label>Upload Infografis 1</label>

                    <label class="input-file-wrapper">
                        <span class="material-symbols-outlined upload-icon">upload</span>
                        <span class="file-label">Klik untuk memilih file</span>
                        <span class="file-types">JPG, PNG, PDF</span>
                        <span class="file-name"></span>

                        <input type="file" name="infografis1" hidden>
                    </label>
                    <small class="file-saat-ini">File saat ini: ${step3Resources.find(r => r.type === "image")?.value || 'Belum ada'}</small>
                </div>

                <div class="modal-form-group">
                    <label>Upload Infografis 2</label>

                    <label class="input-file-wrapper">
                        <span class="material-symbols-outlined upload-icon">upload</span>
                        <span class="file-label">Klik untuk memilih file</span>
                        <span class="file-types">JPG, PNG, PDF</span>
                        <span class="file-name"></span>

                        <input type="file" name="infografis2" hidden>
                    </label>
                    <small class="file-saat-ini">File saat ini: ${step3Resources[1]?.value || 'Belum ada'}</small>
                </div>
            </div>

            <button type="submit" class="modal-submit-btn">
                Simpan Perubahan
            </button>
        </form>
    `;
}

// Fungsi untuk upload file
async function handleFileUpload(inputElement, token) {
    const file = inputElement.files[0];
    if (!file) return;
    
    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);
    
    try {
        const response = await uploadFileResourceRequest(file, token);
        console.log(`Upload response for ${file.name}:`, response);
        
        if (response.success) {
            const key = `modul_resource_path_${inputElement.name}`;
            localStorage.setItem(key, response.path);
            console.log(`Saved to localStorage[${key}]: ${response.path}`);
            
            const fileNameEl = inputElement.closest(".modal-form-group")?.querySelector(".file-name");
            if (fileNameEl) fileNameEl.textContent = file.name;
        } else {
            Toast.error(`Gagal upload file: ${response.message}`);
        }
    } catch (err) {
        console.error("Upload error:", err);
        Toast.error("Upload error: " + err.message);
    }
}

// Tambahkan event listener untuk semua input file di modal
document.addEventListener("change", function (e) {
    const inputFile = e.target.closest('input[type="file"]');
    if (inputFile) {
        const token = localStorage.getItem("token");
        handleFileUpload(inputFile, token);
    }
});

// Fungsi untuk submit form modul CREATE
async function handleSubmitCreateModule(formElement, token) {
    const formData = new FormData(formElement);

    const dokumenPath = localStorage.getItem("modul_resource_path_dokumen_penelitian");
    const pptPath = localStorage.getItem("modul_resource_path_file_ppt");
    const infografis1Path = localStorage.getItem("modul_resource_path_infografis1");
    const infografis2Path = localStorage.getItem("modul_resource_path_infografis2");

    if (!dokumenPath || !pptPath || !infografis1Path || !infografis2Path) {
        Toast.warning("Pastikan semua file sudah diupload sebelum submit!");
        return;
    }

    const body = {
        title: formData.get("judul_modul"),
        description: formData.get("deskripsi_modul"),
        learning_outcomes: formData.get("judul_modul"),
        discussion_enabled: !!formData.get("gunakan_forum"),
        created_by: parseInt(localStorage.getItem("user_id")) || 1,
        objectives: formData.getAll("tujuan[]").filter(obj => obj.trim()),
        steps: [
            {
                step_number: 1,
                step_title: "Microlearning",
                step_type: "video",
                resources: [
                    { type: "video_link", value: formData.get("video_microlearning") },
                    { type: "document", value: dokumenPath }
                ]
            },
            {
                step_number: 2,
                step_title: "Diskusi",
                step_type: "discussion",
                discussion_enabled: !!formData.get("diskusi_rangkuman"),
                resources: [
                    { type: "ppt", value: pptPath }
                ]
            },
            {
                step_number: 3,
                step_title: "Infografis",
                step_type: "infographic",
                resources: [
                    { type: "image", value: infografis1Path },
                    { type: "image", value: infografis2Path }
                ]
            }
        ]
    };

    try {
        console.log("Creating module with body:", body);
        const response = await createModuleRequest(body, token);
        console.log("Create module response:", response);
        
        if (response.success) {
            Toast.success("Modul berhasil dibuat!");
            localStorage.removeItem("modul_resource_path_dokumen_penelitian");
            localStorage.removeItem("modul_resource_path_file_ppt");
            localStorage.removeItem("modul_resource_path_infografis1");
            localStorage.removeItem("modul_resource_path_infografis2");
            
            Modal.hide();
            // Refresh list modul
            window.renderModuleList(localStorage.getItem("token"));
        } else {
            Toast.error(`Gagal membuat modul: ${response.message}`);
        }
    } catch (error) {
        console.error("Error saat membuat modul:", error);
        Toast.error("Terjadi kesalahan saat membuat modul.");
    }
}

async function handleSubmitEditModule(formElement, token, moduleId) {
    const formData = new FormData(formElement);

    const body = {
        title: formData.get("judul_modul"),
        description: formData.get("deskripsi_modul"),
        learning_outcomes: formData.get("judul_modul"),
        discussion_enabled: !!formData.get("gunakan_forum"),
        objectives: formData.getAll("tujuan[]").filter(obj => obj.trim()),
        steps: [
            {
                step_number: 1,
                step_title: "Microlearning",
                step_type: "video",
                resources: [
                    { type: "video_link", value: formData.get("video_microlearning") }
                ]
            },
            {
                step_number: 2,
                step_title: "Diskusi",
                step_type: "discussion",
                discussion_enabled: !!formData.get("diskusi_rangkuman"),
                resources: []
            },
            {
                step_number: 3,
                step_title: "Infografis",
                step_type: "infographic",
                resources: []
            }
        ]
    };

    try {
        console.log("Updating module with body:", body);
        // PERBAIKAN: urutan parameter harus moduleId, body, token
        const response = await updateModuleRequest(moduleId, body, token);
        console.log("Update module response:", response);
        
        if (response.success) {
            Toast.success("Modul berhasil diperbarui!");
            Modal.hide();
            // Refresh list modul
            window.allModules = await renderModuleList(token) || [];
        } else {
            Toast.error(`Gagal update modul: ${response.message}`);
        }
    } catch (error) {
        console.error("Error saat update modul:", error);
        Toast.error("Terjadi kesalahan saat update modul.");
    }
}

// Event listener untuk submit form CREATE
document.addEventListener("submit", function (e) {
    if (e.target.id === "formBuatModul") {
        e.preventDefault();
        const token = localStorage.getItem("token");
        handleSubmitCreateModule(e.target, token);
    }
});

// Event listener untuk submit form EDIT
document.addEventListener("submit", function (e) {
    if (e.target.id === "formEditModul") {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const moduleId = e.target.dataset.moduleId;
        if (!moduleId) {
            Toast.warning("Module ID tidak ditemukan.");
            return;
        }
        handleSubmitEditModule(e.target, token, moduleId);
    }
});

/**
 * Render list modul ke .list-modul, bisa dengan filter judul (keyword)
 * @param {string} token - Token auth
 * @param {string} [keyword] - (Opsional) kata kunci pencarian judul
 * @param {Array} [modulesData] - (Opsional) data modul, jika sudah ada
 */
async function renderModuleList(token, keyword = "", modulesData = null) {
    console.log("[renderModuleList] Mulai fetch/render data modul...");
    try {
        let modules = modulesData;
        if (!modules) {
            const response = await getModuleListRequest(token);
            console.log("[renderModuleList] Response API:", response);

            if (!response.success || !Array.isArray(response.data)) {
                console.error("[renderModuleList] Data modul tidak valid:", response);
                return;
            }
            modules = response.data;
        }

        // Filter jika ada keyword
        let filteredModules = modules;
        if (keyword && keyword.trim() !== "") {
            const lowerKeyword = keyword.toLowerCase();
            filteredModules = modules.filter(modul =>
                (modul.title || "").toLowerCase().includes(lowerKeyword)
            );
            console.log(`[renderModuleList] Filtered by "${keyword}", hasil: ${filteredModules.length}`);
        }

        const listContainer = document.querySelector(".list-modul");
        if (!listContainer) {
            console.error("[renderModuleList] .list-modul tidak ditemukan di DOM");
            return;
        }

        listContainer.innerHTML = "";

        filteredModules.forEach(modul => {
            const title = modul.title || "-";
            const students_completed = modul.students_completed ?? 0;
            const is_active = modul.is_active ? "aktif" : "nonaktif";
            const completion_percent = modul.completion_percent ? modul.completion_percent : 0;

            const card = document.createElement("div");
            card.className = "card-list-modul";
            if (modul.id || modul.module_id) {
                card.dataset.moduleId = modul.id || modul.module_id;
            }
            card.innerHTML = `
                <div class="header-modul">
                  <div class="tema-modul">
                    <p class="icon-modul">
                      <span class="material-symbols-outlined">book</span>
                    </p>
                    <div class="judul-modul">
                      <h5>${title}</h5>
                      <p>${students_completed} Mahasiswa</p>
                    </div>
                  </div>
                  <div class="action-modul">
                    <p class="status-modul ${is_active}">${is_active.charAt(0).toUpperCase() + is_active.slice(1)}</p>
                    <p id="btnLihatPenyelesaian" title="Lihat Penyelesaian">
                      <span class="material-symbols-outlined">visibility</span>
                    </p>
                    <p id="btnEditModul" title="Edit Modul">
                      <span class="material-symbols-outlined">edit_square</span>
                    </p>
                    <p id="btnHapusModul" title="Hapus Modul">
                        <span class="material-symbols-outlined">delete</span>
                    </p>
                  </div>
                </div>
                <div class="footer-modul">
                  <div class="info-progress-bar">
                    <h5>Penyelesaian</h5>
                    <p>${completion_percent}%</p>
                  </div>
                  <div class="progress-wrapper">
                      <div class="progress-micro">
                          <div class="progress-bar" style="width: ${completion_percent}%;"></div>
                      </div>
                  </div>
                </div>
            `;
            listContainer.appendChild(card);
        });

        console.log(`[renderModuleList] Berhasil render ${filteredModules.length} modul`);
        return modules;
    } catch (err) {
        console.error("[renderModuleList] Error:", err);
    }
}

// ============================================
// HELPER: Parse ISO Date menjadi date dan time string
// ============================================
function parseCompletedDate(isoString) {
    if (!isoString) {
        return {
            date: "-",
            time: "-"
        };
    }
    
    try {
        const date = new Date(isoString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return {
            date: `${yyyy}-${mm}-${dd}`,
            time: `${hours}:${minutes}`
        };
    } catch (err) {
        console.error("Error parsing date:", err);
        return {
            date: "-",
            time: "-"
        };
    }
}

// Helper untuk escape HTML (prevent XSS)
function escapeHtml(s) {
    if (!s) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================
// EVENT DELEGATION: LIHAT PENYELESAIAN (PERBAIKAN)
// ============================================
document.addEventListener("click", async function (e) {
    const btn = e.target.closest("#btnLihatPenyelesaian");
    if (!btn) return;

    const card = btn.closest(".card-list-modul");
    const moduleId = card?.dataset?.moduleId;
    if (!moduleId) {
        Toast.warning("Module ID tidak ditemukan.");
        return;
    }

    const token = localStorage.getItem("token");
    try {
        // PERBAIKAN: moduleId dulu, token kedua
        const res = await getCompleteStudentByModuleIdRequest(moduleId, token);
        if (!res.success || !Array.isArray(res.data)) {
            Modal.show({
                title: "Penyelesaian Modul Mahasiswa",
                size: "medium",
                content: `<div class="submission-modul-card-wrapper"><p>Belum ada data mahasiswa.</p></div>`
            });
            return;
        }
        const html = res.data.map(mhs => {
            const dateInfo = parseCompletedDate(mhs.completed_at);
            return `
                <div class="submission-modul-card">
                    <div class="submission-modul-header">
                        <div>
                            <div class="submission-modul-name">${escapeHtml(mhs.name || '-')}</div>
                            <div class="submission-modul-npm">NPM : ${escapeHtml(String(mhs.nidn || '-'))}</div>
                        </div>
                        <div class="submission-modul-date">
                            <div class="submission-modul-date-day">${dateInfo.date}</div>
                            <div class="submission-modul-time">${dateInfo.time} WIT</div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
        Modal.show({
            title: "Penyelesaian Modul Mahasiswa",
            size: "medium",
            content: `<div class="submission-modul-card-wrapper">${html}</div>`
        });
    } catch (err) {
        console.error("Error:", err);
        Toast.error("Gagal mengambil data mahasiswa.");
    }
});

// ============================================
// EVENT DELEGATION: EDIT MODUL (OPTIMIZED)
// ============================================
document.addEventListener("click", async function (e) {
    const btn = e.target.closest("#btnEditModul");
    if (!btn) return;

    const card = btn.closest(".card-list-modul");
    const moduleId = card?.dataset?.moduleId;
    if (!moduleId) {
        Toast.warning("Module ID tidak ditemukan.");
        return;
    }

    const token = localStorage.getItem("token");
    
    try {
        console.log("[Edit Modul] Fetch data lengkap dari API untuk moduleId:", moduleId);
        
        // Fetch data lengkap dari API (yang sudah sesuai dengan form)
        const response = await getModuleById(moduleId, token);
        
        if (!response.success || !response.data) {
            Toast.error("Gagal mengambil data modul.");
            return;
        }

        const modul = response.data;
        console.log("[Edit Modul] Data modul:", modul);

        // Generate form dengan data modul
        const formContent = generateEditModuleForm(modul);
        
        Modal.show({
            title: "Edit Modul Pembelajaran",
            size: "large",
            content: formContent
        });

        // Set moduleId ke form untuk submit handler
        setTimeout(() => {
            const form = document.getElementById("formEditModul");
            if (form) {
                form.dataset.moduleId = moduleId;
            }
        }, 50);

    } catch (err) {
        console.error("Error:", err);
        Toast.error("Gagal mengambil data modul.");
    }
});

// ============================================
// EVENT DELEGATION: HAPUS MODUL (PERBAIKAN)
// ============================================
document.addEventListener("click", function (e) {
    const btn = e.target.closest("#btnHapusModul");
    if (!btn) return;

    const card = btn.closest(".card-list-modul");
    const moduleId = card?.dataset?.moduleId;
    if (!moduleId) {
        Toast.warning("Module ID tidak ditemukan.");
        return;
    }

    const token = localStorage.getItem("token");

    // 🆕 PERBAIKAN: Pass onConfirm callback ke Modal.confirmDelete
    Modal.confirmDelete(
        "Apakah Anda yakin ingin menghapus modul ini?",
        async () => {
            try {
                const res = await deleteModuleRequest(moduleId, token);
                if (res.success) {
                    // Refresh list modul
                    await renderModuleList(token);
                    console.log("✅ Modul berhasil dihapus");
                } else {
                    Toast.error("Gagal menghapus modul: " + (res.message || "Unknown error"));
                }
            } catch (err) {
                console.error("❌ Error deleting module:", err);
                Toast.error("Gagal menghapus modul: " + err.message);
            }
        }
    );
});

/**
 * Helper untuk mengisi card "Modul Aktiv" di monitoring page
 * @param {Array} modulesData - Array data modul dari getModuleListRequest
 */
function updateModulAktifCard(modulesData) {
    if (!Array.isArray(modulesData) || modulesData.length === 0) {
        return;
    }

    // Hitung modul yang aktif (is_active = 1)
    const activeModulesCount = modulesData.filter(modul => modul.is_active === 1).length;

    // Hitung modul yang selesai (completion_percent = 100)
    const completedModulesCount = modulesData.filter(modul => {
        const completionPercent = modul.completion_percent;
        // Jika null atau di bawah 100, anggap 0
        if (completionPercent === null || completionPercent === undefined) {
            return false;
        }
        // Convert string ke number jika perlu
        const percent = typeof completionPercent === 'string' 
            ? parseInt(completionPercent, 10) 
            : completionPercent;
        return percent === 100;
    }).length;

    // Update h2 dengan jumlah modul aktif
    const h2Element = document.querySelector('.card-monitoring:nth-child(3) h2');
    if (h2Element) {
        h2Element.textContent = activeModulesCount;
    }

    // Update h4 dengan jumlah modul selesai
    const h5Element = document.querySelector('.card-monitoring:nth-child(3) h5:not([class])');
    if (h5Element) {
        h5Element.textContent = `${completedModulesCount} Selesai`;
    }
}

/**
 * Helper untuk menghitung total modul
 * @param {Array} modulesData - Array data modul dari getModuleListRequest
 * @returns {number} - Jumlah total modul
 */
function getTotalModulCount(modulesData) {
    if (!Array.isArray(modulesData)) {
        return 0;
    }
    return modulesData.length;
}

/**
 * Helper untuk mengisi card "Total Modul" di beranda page
 * @param {Array} modulesData - Array data modul dari getModuleListRequest
 */
function updateTotalModulCard(modulesData) {
    const totalCount = getTotalModulCount(modulesData);
    
    // Update h2 pertama di card-beranda-wrapper dengan jumlah total modul
    const h2Element = document.querySelector('.card-beranda-wrapper .card-beranda:first-child h2');
    if (h2Element) {
        h2Element.textContent = totalCount;
    }
}

/**
 * Helper untuk mengisi card "Penyelesaian" di beranda page dengan jumlah modul yang selesai
 * @param {Array} modulesData - Array data modul dari getModuleListRequest
 */
function updateCompletedModulCard(modulesData) {
    if (!Array.isArray(modulesData) || modulesData.length === 0) {
        return;
    }

    // Hitung modul yang selesai (completion_percent = 100)
    const completedModulesCount = modulesData.filter(modul => {
        const completionPercent = modul.completion_percent;
        // Jika null atau di bawah 100, anggap 0
        if (completionPercent === null || completionPercent === undefined) {
            return false;
        }
        // Convert string ke number jika perlu
        const percent = typeof completionPercent === 'string' 
            ? parseInt(completionPercent, 10) 
            : completionPercent;
        return percent === 100;
    }).length;

    // Update h2 di card Penyelesaian (card ke-4)
    const h2Element = document.querySelector('.card-beranda-wrapper .card-beranda:nth-child(4) h2');
    if (h2Element) {
        h2Element.textContent = completedModulesCount;
    }
}

/**
 * Helper untuk prepare data chart dari modules data
 * @param {Array} modulesData - Array data modul
 * @param {number} [totalUsers=0] - Total mahasiswa aktif untuk perhitungan incomplete
 */
function prepareChartDataFromModules(modulesData, totalUsers = 0) {
    if (!Array.isArray(modulesData) || modulesData.length === 0) {
        return {
            categories: [],
            completedData: [],
            incompleteData: []
        };
    }

    const sortedModules = [...modulesData].sort((a, b) => 
        (a.module_id || a.id) - (b.module_id || b.id)
    );

    const categories = sortedModules.map((_, idx) => `Modul ${idx + 1}`);
    
    const completedData = sortedModules.map(m => 
        parseInt(m.students_completed) || 0
    );
    
    // Incomplete = totalUsers (mahasiswa aktif) - students_completed
    const incompleteData = sortedModules.map(m => {
        const completed = parseInt(m.students_completed) || 0;
        return Math.max(0, totalUsers - completed);
    });

    console.log("[prepareChartDataFromModules] totalUsers:", totalUsers, "incomplete:", incompleteData);

    return {
        categories,
        completedData,
        incompleteData
    };
}

export {
    renderModuleList,
    updateModulAktifCard,
    getTotalModulCount,
    updateTotalModulCard,
    updateCompletedModulCard,
    prepareChartDataFromModules
};