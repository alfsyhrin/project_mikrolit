import { createModuleRequest, uploadFileResourceRequest, getModuleListRequest } from "../../../assets/api.js";
import Modal from "../../../assets/modal.js";
console.log("micro-learning.js loaded");

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
            alert(`Gagal upload file: ${response.message}`);
        }
    } catch (err) {
        console.error("Upload error:", err);
        alert("Upload error: " + err.message);
    }
}

// Tambahkan event listener untuk semua input file di modal
document.addEventListener("change", function (e) {
    const inputFile = e.target.closest('input[type="file"]');
    if (inputFile) {
        const token = localStorage.getItem("token"); // Ambil token dari localStorage
        handleFileUpload(inputFile, token);
    }
});

// Fungsi untuk submit form modul
async function handleSubmitCreateModule(formElement, token) {
    const formData = new FormData(formElement);

    // Ambil path file dari localStorage
    const dokumenPath = localStorage.getItem("modul_resource_path_dokumen_penelitian");
    const pptPath = localStorage.getItem("modul_resource_path_file_ppt");
    const infografis1Path = localStorage.getItem("modul_resource_path_infografis1");
    const infografis2Path = localStorage.getItem("modul_resource_path_infografis2");

    // Validasi: pastikan semua file sudah diupload (jika wajib)
    if (!dokumenPath || !pptPath || !infografis1Path || !infografis2Path) {
        alert("Pastikan semua file sudah diupload sebelum submit!");
        return;
    }

    const body = {
        title: formData.get("judul_modul"),
        description: formData.get("deskripsi_modul"),
        learning_outcomes: formData.get("judul_modul"), // atau buat input terpisah di form
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
            alert("Modul berhasil dibuat!");
            
            // 🔥 CLEANUP: hapus path dari localStorage setelah submit sukses
            localStorage.removeItem("modul_resource_path_dokumen_penelitian");
            localStorage.removeItem("modul_resource_path_file_ppt");
            localStorage.removeItem("modul_resource_path_infografis1");
            localStorage.removeItem("modul_resource_path_infografis2");
            
            Modal.hide();
        } else {
            alert(`Gagal membuat modul: ${response.message}`);
        }
    } catch (error) {
        console.error("Error saat membuat modul:", error);
        alert("Terjadi kesalahan saat membuat modul.");
    }
}

// Tambahkan event listener untuk submit form
document.addEventListener("submit", function (e) {
    if (e.target.id === "formBuatModul") {
        e.preventDefault();
        const token = localStorage.getItem("token"); // Ambil token dari localStorage
        handleSubmitCreateModule(e.target, token);
    }
});

/**
 * Render list modul ke .list-modul, bisa dengan filter judul (keyword)
 * @param {string} token - Token auth
 * @param {string} [keyword] - (Opsional) kata kunci pencarian judul
 * @param {Array} [modulesData] - (Opsional) data modul, jika sudah ada (biar tidak fetch ulang)
 */
export async function renderModuleList(token, keyword = "", modulesData = null) {
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

        // Kosongkan list sebelum render ulang
        listContainer.innerHTML = "";

        filteredModules.forEach(modul => {
            const title = modul.title || "-";
            const students_completed = modul.students_completed ?? 0;
            const is_active = modul.is_active ? "aktif" : "nonaktif";
            const completion_percent = modul.completion_percent ? modul.completion_percent : 0;

            const card = document.createElement("div");
            card.className = "card-list-modul";
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
                    <p>
                      <span class="material-symbols-outlined">visibility</span>
                    </p>
                    <p>
                      <span class="material-symbols-outlined">edit_square</span>
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
        // Return data agar bisa dipakai ulang (misal untuk search berikutnya)
        return modules;
    } catch (err) {
        console.error("[renderModuleList] Error:", err);
    }
}