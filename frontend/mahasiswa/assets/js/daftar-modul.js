import { getModuleLearningRequest, getModuleLearnDetailRequest, API_BASE } from "../../../assets/api.js?v=20260331-1";

const BACKEND_BASE = String(API_BASE).replace(/\/api\/?$/, "");
import Toast from "../../../assets/toast.js";

/**
 * Render semua modul ke card di halaman daftar-modul
 */
export async function renderDaftarModul() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("[renderDaftarModul] No token found");
            return;
        }

        // Fetch data modul dengan progress
        const response = await getModuleLearningRequest(token);
        
        if (!response.success || !Array.isArray(response.data)) {
            console.error("[renderDaftarModul] Invalid response:", response);
            return;
        }

        const modules = response.data;
        const container = document.querySelector(".container-modul-mahasiswa");
        
        if (!container) {
            console.warn("[renderDaftarModul] Container not found");
            return;
        }

        // Clear container
        container.innerHTML = "";

        // Render setiap modul
        modules.forEach((module) => {
            const card = createModuleCard(module);
            container.appendChild(card);
        });

        console.log("[renderDaftarModul] Render berhasil:", modules.length, "modul");
    } catch (error) {
        console.error("[renderDaftarModul] Error:", error);
    }
}

/**
 * Helper: Buat element card untuk satu modul
 */
function createModuleCard(module) {
    const {
        id,
        title,
        description,
        progress_percent = 0,
        completed_steps = 0,
        total_steps = 0
    } = module;

    // Tentukan status berdasarkan progress
    let statusClass = "belum-dimulai";
    let statusText = "Belum Dimulai";
    
    if (progress_percent === 100) {
        statusClass = "selesai";
        statusText = "Selesai";
    } else if (progress_percent > 0) {
        statusClass = "sedang-berlangsung";
        statusText = "Sedang Berlangsung";
    }

    // Hitung next step untuk tombol "Lanjut Belajar"
    const nextStep = completed_steps + 1;
    const lanjutBelajarText = progress_percent === 100 
        ? `Lihat Kembali - Step ${total_steps}/${total_steps}`
        : `Lanjut Belajar - Step ${nextStep}/${total_steps}`;

    // Create card element
    const card = document.createElement("a");
    card.href = "#";
    card.className = "card-modul-mahasiswa-menu";
    card.setAttribute("data-page", "modul");
    card.setAttribute("data-module-id", id);

    card.innerHTML = `
        <div class="header-card-modul-mahasiswa">
            <div class="wrapper-header-card-modul-mhs">
                <p class="icon-card-modul-mahasiswa">
                    <span class="material-symbols-outlined">import_contacts</span>
                </p>
                <div class="info-judul-card-mhs">
                    <h3>${escapeHtml(title || "Modul Tanpa Judul")}</h3>
                    <p>${escapeHtml(description || "Tidak ada deskripsi")}</p>
                </div>
            </div>
            <p class="card-modul-mhs-status ${statusClass}">${statusText}</p>
        </div>
        <div class="footer-card-modul-mahasiswa">
            <div class="progress-wrapper">
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress_percent}%;"></div>
                </div>
                <span class="precentage">${progress_percent}%</span>
            </div>
            ${progress_percent < 100 ? `
                <a href="#" data-page="modul" class="lanjut-belajar-modul">
                    <span class="material-symbols-outlined">play_arrow</span>
                    ${lanjutBelajarText}
                </a>
            ` : ''}
        </div>
    `;

    return card;
}

/**
 * Render detail modul dan steps ke halaman modul.html
 */
// Replace renderModuleDetail, renderModuleInfo, renderModuleSteps and createStepElement
export async function renderModuleDetail(moduleId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("[renderModuleDetail] No token found");
            return;
        }

        console.log("[renderModuleDetail] Loading module:", moduleId);

        const response = await getModuleLearnDetailRequest(moduleId, token);
        if (!response.success || !response.data) {
            console.error("[renderModuleDetail] Invalid response:", response);
            return;
        }

        const { module, steps } = response.data;

        // Render module info (title, description, progress, objectives)
        renderModuleInfo(module);

        // Render steps and pass module id so step elements include it
        renderModuleSteps(module.title, steps || [], module.id);

        console.log("[renderModuleDetail] Render berhasil untuk module:", moduleId);
    } catch (error) {
        console.error("[renderModuleDetail] Error:", error);
    }
}

function renderModuleInfo(module) {
    // Update title
    const h2 = document.querySelector(".card-modul h2");
    if (h2) h2.textContent = module.title || "Modul Tanpa Judul";

    // Update description
    const desc = document.querySelector(".deskripsi-modul");
    if (desc) desc.textContent = module.description || "Tidak ada deskripsi";

    // Update progress bar and percent
    const progressFill = document.querySelector(".progress-fill");
    const progressPercent = document.querySelector(".progress-modul");
    const progress = (typeof module.progress_percent === "number") ? module.progress_percent : (module.progress_percent || 0);
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = `${progress}%`;

    // Render objectives
    const ul = document.querySelector(".learning-objectives ul");
    if (ul) {
        ul.innerHTML = "";
        (module.objectives || []).forEach(obj => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="material-symbols-outlined">check_circle</span> ${escapeHtml(obj)}`;
            ul.appendChild(li);
        });
    }

    // ✅ TAMBAH: Render tombol "Mulai Modul"
    renderStartModuleButton(module);
}

// ✅ BARU: Render tombol "Mulai Modul"
function renderStartModuleButton(module) {
    const container = document.getElementById("btn-start-module-container");
    if (!container) return;

    // Hanya tampilkan tombol jika progress < 100% (belum selesai)
    if (module.progress_percent >= 100) {
        container.innerHTML = "";
        return;
    }

    // Render tombol
    container.innerHTML = `
        <button class="btn-mulai-modul" id="btn-start-module" data-module-id="${module.id}">
            <span class="material-symbols-outlined">play_arrow</span>
            Mulai Modul
        </button>
    `;

    // Attach event listener
    const btn = container.querySelector("#btn-start-module");
    if (btn) {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            await handleStartModule(module.id);
        });
    }
}

// ✅ BARU: Handle click tombol "Mulai Modul"
async function handleStartModule(moduleId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            Toast.warning("Token tidak ditemukan. Silakan login kembali.");
            return;
        }

        const { startModuleRequest } = await import("../../../assets/api.js?v=20260331-1")
        
        console.log("[handleStartModule] POST ke /student/modules/" + moduleId + "/start");
        const response = await startModuleRequest(moduleId, token);

        if (response && response.success) {
            console.log("[handleStartModule] ✅ Modul berhasil dimulai:", response);
            Toast.success("Modul berhasil dimulai! 🎉");
            
            // Refresh halaman modul dengan memanggil renderModuleDetail kembali
            if (window.renderModuleDetail) {
                window.renderModuleDetail(moduleId);
            }
        } else {
            const msg = response?.message || "Gagal memulai modul";
            console.error("[handleStartModule] Error:", msg);
            Toast.error("Gagal: " + msg);
        }
    } catch (error) {
        console.error("[handleStartModule] Error:", error);
        Toast.error("Error: " + error.message);
    }
}

function renderModuleSteps(moduleTitle, steps, moduleId) {
    // Set h3 to include module title (keep label + title)
    const h3 = document.querySelector(".card-step h3");
    if (h3) h3.textContent = `Urutan Pembelajaran — ${moduleTitle || ""}`;

    const wrapper = document.querySelector(".wrapper-step");
    if (!wrapper) return;

    wrapper.innerHTML = "";

    // Ensure steps are ordered by step_number
    const ordered = (steps || []).slice().sort((a,b) => (a.step_number || 0) - (b.step_number || 0));

    ordered.forEach(step => {
        const el = createStepElement(step, moduleId);
        wrapper.appendChild(el);
    });
}

function createStepElement(step, moduleId) {
    const { step_number, step_title, step_type, status } = step;

    const statusMap = {
        'completed': { cssClass: 'selesai', icon: 'check_circle', text: 'Selesai' },
        'current': { cssClass: 'berlangsung', icon: 'progress_activity', text: 'Berlangsung' },
        'locked': { cssClass: 'terkunci', icon: 'lock', text: 'Terkunci' }
    };

    const statusKey = status || 'locked';
    const statusInfo = statusMap[statusKey] || statusMap['locked'];

    const div = document.createElement("div");
    div.className = `step-item ${statusInfo.cssClass}`;
    // Attach attributes for navigation handlers
    div.setAttribute("data-module-id", moduleId);
    div.setAttribute("data-step-number", step_number);
    div.setAttribute("data-status", statusKey);

    div.innerHTML = `
        <div class="step-icon ${statusInfo.cssClass}">
            <span class="material-symbols-outlined">${statusInfo.icon}</span>
        </div>

        <div class="step-info">
            <span class="step-number">STEP ${step_number}</span>
            <h4>${escapeHtml(step_type || "Step")}</h4>
            <p>${escapeHtml(step_title || "Tanpa deskripsi")}</p>
        </div>

        <span class="status ${statusInfo.cssClass}">${statusInfo.text}</span>
    `;

    return div;
}

//helper get youtube url id
function extractYouTubeVideoId(url = "") {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.replace("/", "").trim() || null;
        }

        const v = parsed.searchParams.get("v");
        if (v) return v;

        const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
        if (embedMatch) return embedMatch[1];

        const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
        if (shortsMatch) return shortsMatch[1];

        return null;
    } catch {
        return null;
    }
}

function getYouTubeEmbedUrl(url = "") {
    const id = extractYouTubeVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
}

function getYouTubeThumbnailUrl(url = "") {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

// //helper untuk preview gambar
// function getApiBaseUrl() {
//     // bisa dioverride global kalau API beda domain/subdomain
//     if (window.__API_BASE_URL__) {
//         return String(window.__API_BASE_URL__).replace(/\/+$/, "");
//     }

//     // fallback default: pakai origin website saat ini
//     return window.location.origin.replace(/\/+$/, "");
// }

// function buildPublicResourceUrl(resourceValue = "") {
//     if (!resourceValue) return "";

//     const value = String(resourceValue).trim();

//     // sudah full url
//     if (/^https?:\/\//i.test(value)) {
//         return value;
//     }

//     const normalized = value.replace(/^\/+/, "");
//     const apiBase = getApiBaseUrl();

//     // resource path dari backend: module_resources/images/...
//     return `${apiBase}/uploads/${normalized}`;
// }

//helper nama file bersih
function getCleanFileName(filePath = "") {
    if (!filePath) return "File";

    const rawName = String(filePath).split("/").pop() || String(filePath);

    let decodedName = rawName;
    try {
        decodedName = decodeURIComponent(rawName);
    } catch (_) {}

    const dotIndex = decodedName.lastIndexOf(".");
    const hasExt = dotIndex > 0;
    const ext = hasExt ? decodedName.slice(dotIndex) : "";
    let base = hasExt ? decodedName.slice(0, dotIndex) : decodedName;

    // hapus timestamp di depan
    base = base.replace(/^\d{10,}[-_]?/, "");

    // hapus suffix hash/unik di belakang
    base = base.replace(/[-_][a-f0-9]{6,}$/i, "");

    // rapikan separator
    base = base.replace(/[_-]{2,}/g, "_");
    base = base.replace(/^[\s_-]+|[\s_-]+$/g, "");

    return `${base || "File"}${ext}`;
}

//helper build preview image dari  url
// function getBackendBaseUrl() {
//     if (window.__API_BASE_URL__) {
//         return String(window.__API_BASE_URL__).replace(/\/+$/, "");
//     }

//     // fallback lokal
//     return "http://localhost:4000";
// }

function buildResourcePublicUrl(resource = {}) {
    const candidate = resource.preview_url || resource.public_url || resource.value || "";
    if (!candidate) return "";

    if (/^https?:\/\//i.test(candidate)) {
        return candidate;
    }

    const raw = String(candidate).trim();

    if (raw.startsWith("/uploads/")) {
        return `${BACKEND_BASE}${raw}`;
    }

    const normalized = raw.replace(/^\/+/, "");

    if (normalized.startsWith("module_resources/")) {
        return `${BACKEND_BASE}/uploads/${normalized}`;
    }

    return `${BACKEND_BASE}/${normalized}`;
}

function isImageResource(type = "", value = "") {
    const t = String(type).toLowerCase();
    const v = String(value).toLowerCase();

    return (
        t === "image" ||
        t.includes("image") ||
        /\.(png|jpe?g|gif|webp|svg)$/i.test(v)
    );
}

/**
 * Helper: Escape HTML untuk prevent XSS
 */
function escapeHtml(text) {
    if (!text) return "";
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Render detail step (panggil setelah modul-step page di-load)
export async function renderStepDetail(moduleId, stepNumber) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("[renderStepDetail] no token");
            return;
        }

        const { getStepDetailRequest, startStepModuleRequest } = await import("../../../assets/api.js?v=20260331-1")
        const resp = await getStepDetailRequest(moduleId, stepNumber, token);

        if (!resp || !resp.success || !resp.data) {
            console.error("[renderStepDetail] invalid response", resp);
            return;
        }

        const { step, resources } = resp.data;

        // If step is current, notify backend that student started the step
        if (step.status === "current") {
            try { await startStepModuleRequest(moduleId, stepNumber, token); }
            catch (e) { console.warn("[renderStepDetail] startStep warning:", e); }
        }

        // ✅ Check if this is a discussion step (step 2 or marked as discussion type)
        const isDiscussionStep = step.step_type === "lesson" || stepNumber === 2;
        
        renderStepDetailUI(step, resources || [], moduleId, stepNumber, token, isDiscussionStep);

    } catch (err) {
        console.error("[renderStepDetail] Error:", err);
    }
}

// Build UI for step detail (simple, follows modul-stepone layout)
function renderStepDetailUI(step, resources, moduleId, stepNumber, token, isDiscussionStep = false) {
    const content = document.querySelector(".content");
    if (!content) return;

    const statusClass = step.status === "completed" ? "selesai" : step.status === "current" ? "berlangsung" : "terkunci";
    const statusText = step.status === "completed" ? "Selesai" : step.status === "current" ? "Berlangsung" : "Terkunci";
    const typeLabel = (step.step_type || "Step").toUpperCase();

    // Simple mapping for display icon/label per type
    const typeTitle = {
        video: "Video & Dokumen",
        lesson: "PPT & Poin Penting",
        infographic: "Infografis"
    }[step.step_type] || (step.step_type || "Step");

    // Render HTML (ke dalam main content area)
    content.innerHTML = `
        <div class="container-step-modul">
            <a href="#" class="back-link" data-page="modul" data-module-id="${moduleId}">
                <span class="material-symbols-outlined">arrow_back</span>
                Kembali ke Detail Modul
            </a>

            <div class="card-step-modul-one">
                <div class="card-step-header">
                    <p class="step-label">
                        <span class="material-symbols-outlined">play_arrow</span>
                        STEP ${step.step_number} – ${typeTitle.toUpperCase()}
                    </p>
                    <h2>${escapeHtml(step.step_title || "Tanpa Judul")}</h2>
                </div>

                <div class="card-step-body">
                    <div id="step-resources-root"></div>
                    ${isDiscussionStep && step.status === "current" ? `
                        <div class="discussion-section">
                            <h3 class="section-title"><span class="material-symbols-outlined">chat</span> Poin Penting</h3>
                            <div class="discussion-box">
                                <textarea id="discussion-textarea" placeholder="Tulis poin penting dan rangkuman yang Anda dapatkan dari materi..."></textarea>
                            </div>
                        </div>
                    ` : ""}
                </div>

                <div class="card-step-footer">
                    ${step.status === "current" && isDiscussionStep ? `<button class="btn-selesai btn-complete-step-discussion" data-module-id="${moduleId}" data-step-number="${stepNumber}"><span class="material-symbols-outlined">task_alt</span> Submit dan Selesaikan Step</button>` : ""}
                    ${step.status === "current" && !isDiscussionStep ? `<button class="btn-selesai btn-complete-step" data-module-id="${moduleId}" data-step-number="${stepNumber}"><span class="material-symbols-outlined">task_alt</span> Tandai Selesai</button>` : ""}
                </div>
            </div>
        </div>
    `;

    // Render resources list inside #step-resources-root
    const root = document.getElementById("step-resources-root");
    if (!root) return;

    // Group resources into types for rendering
    if (resources.length === 0) {
        root.innerHTML = `<p>Tidak ada resources untuk step ini.</p>`;
    } else {
        root.innerHTML = resources.map((r, index) => {
            const t = (r.type || "").toLowerCase();
            const cleanName = getCleanFileName(r.value);

        if (t.includes("video")) {
            const embedUrl = getYouTubeEmbedUrl(r.value);
            const safeVideoUrl = escapeHtml(r.value || "");
            const safeTitle = escapeHtml(cleanName || "Video Pembelajaran");

            return `
                <div class="section-step">
                    <h3 class="section-title">
                        <span class="material-symbols-outlined">videocam</span>
                        Video Pembelajaran
                    </h3>

                    <div class="video-wrapper">
                        ${
                            embedUrl
                                ? `
                                    <div class="video-embed-container">
                                        <iframe
                                            class="video-embed-frame"
                                            src="${embedUrl}"
                                            title="${safeTitle}"
                                            frameborder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowfullscreen
                                            referrerpolicy="strict-origin-when-cross-origin"
                                        ></iframe>
                                    </div>
                                `
                                : `
                                    <div class="video-placeholder">
                                        <a class="video-link" href="${safeVideoUrl}" target="_blank" rel="noopener noreferrer">
                                            <span class="material-symbols-outlined play-icon">play_arrow</span>
                                            <p class="video-title">${safeTitle}</p>
                                        </a>
                                    </div>
                                `
                        }

                        <div class="video-note">
                            <span class="material-symbols-outlined">star</span>
                            Link video disediakan dosen
                        </div>
                    </div>
                </div>
            `;
        }

            if (t === "ppt" || t.includes("presentation")) {
                return `
                    <div class="section-step">
                        <h3 class="section-title">
                            <span class="material-symbols-outlined">slideshow</span>
                            Resource: PPT
                        </h3>
                        <div class="document-card">
                            <div class="doc-left">
                                <div class="doc-icon">
                                    <span class="material-symbols-outlined">description</span>
                                </div>
                                <div class="doc-info">
                                    <h4>${escapeHtml(cleanName)}</h4>
                                </div>
                            </div>
                            <button
                                class="btn-download btn-download-resource"
                                data-module-id="${moduleId}"
                                data-step-number="${stepNumber}"
                                data-resource-type="${escapeHtml(r.type)}"
                                data-resource-name="${escapeHtml(cleanName)}"
                            >
                                <span class="material-symbols-outlined">download</span>
                                Unduh
                            </button>
                        </div>
                    </div>
                `;
            }

            if (t === "image" || t.includes("image")) {
                const imageUrl = buildResourcePublicUrl(r);
                const title = escapeHtml(cleanName || ` Analisis Infografis ${index + 1}`);

                return `
                    <div class="section-step">
                        <h3 class="section-title">
                            <span class="material-symbols-outlined">image</span>
                            Analisis Infografis ${index + 1}
                        </h3>

                        <div class="infografis-card-dynamic">
                            <div class="infografis-preview-box">
                                <img
                                    src="${escapeHtml(imageUrl)}"
                                    alt="${title}"
                                    class="infografis-preview-image"
                                    loading="lazy"
                                    data-full-image="${escapeHtml(imageUrl)}"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                />
                                <div class="infografis-preview-fallback" style="display:none;">
                                    <span class="material-symbols-outlined preview-icon">image</span>
                                    <p class="preview-title">${title}</p>
                                    <p class="preview-desc">Preview gambar tidak tersedia</p>
                                </div>
                            </div>

                            <div class="document-card">
                                <div class="doc-left">
                                    <div class="doc-icon">
                                        <span class="material-symbols-outlined">image</span>
                                    </div>
                                    <div class="doc-info">
                                        <h4>${title}</h4>
                                    </div>
                                </div>
                                <button
                                    class="btn-download btn-download-resource"
                                    data-module-id="${moduleId}"
                                    data-step-number="${stepNumber}"
                                    data-resource-type="${escapeHtml(r.type)}"
                                    data-resource-name="${title}"
                                >
                                    <span class="material-symbols-outlined">download</span>
                                    Unduh
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (t.includes("document") || t.includes("pdf") || t.includes("doc")) {
                return `
                    <div class="section-step">
                        <h3 class="section-title">
                            <span class="material-symbols-outlined">description</span>
                            Dokumen
                        </h3>
                        <div class="document-card">
                            <div class="doc-left">
                                <div class="doc-icon">
                                    <span class="material-symbols-outlined">description</span>
                                </div>
                                <div class="doc-info">
                                    <h4>${escapeHtml(cleanName)}</h4>
                                </div>
                            </div>
                            <button
                                class="btn-download btn-download-resource"
                                data-module-id="${moduleId}"
                                data-step-number="${stepNumber}"
                                data-resource-type="${escapeHtml(r.type)}"
                                data-resource-name="${escapeHtml(cleanName)}"
                            >
                                <span class="material-symbols-outlined">download</span>
                                Unduh
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="section-step">
                    <h3 class="section-title">
                        <span class="material-symbols-outlined">folder</span>
                        Resource: ${escapeHtml(r.type)}
                    </h3>
                    <div class="document-card">
                        <div class="doc-left">
                            <div class="doc-icon">
                                <span class="material-symbols-outlined">folder</span>
                            </div>
                            <div class="doc-info">
                                <h4>${escapeHtml(cleanName)}</h4>
                            </div>
                        </div>
                        <button
                            class="btn-download btn-download-resource"
                            data-module-id="${moduleId}"
                            data-step-number="${stepNumber}"
                            data-resource-type="${escapeHtml(r.type)}"
                            data-resource-name="${escapeHtml(cleanName)}"
                        >
                            <span class="material-symbols-outlined">download</span>
                            Unduh
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    root.querySelectorAll(".infografis-preview-image").forEach((img) => {
        img.addEventListener("click", () => {
            const fullImage = img.getAttribute("data-full-image");
            if (fullImage) {
                window.open(fullImage, "_blank", "noopener,noreferrer");
            }
        });
    });

    // Attach download handlers
    root.querySelectorAll(".btn-download-resource").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const mId = btn.getAttribute("data-module-id");
            const sNo = btn.getAttribute("data-step-number");
            const rType = btn.getAttribute("data-resource-type");
            const rName = btn.getAttribute("data-resource-name");
            await downloadResource(mId, sNo, rType, token, rName);
        });
    });

    // ✅ BARU: Attach discussion+complete handler (untuk step 2 - merged button)
    const btnCompleteDiscussion = content.querySelector(".btn-complete-step-discussion");
    if (btnCompleteDiscussion) {
        btnCompleteDiscussion.addEventListener("click", async (e) => {
            e.preventDefault();
            const mId = btnCompleteDiscussion.getAttribute("data-module-id");
            const sNo = btnCompleteDiscussion.getAttribute("data-step-number");
            const textarea = content.querySelector("#discussion-textarea");
            const discussionPoint = textarea ? textarea.value.trim() : "";
            
            if (!discussionPoint) {
                Toast.warning("Tulis poin penting terlebih dahulu!");
                return;
            }
            
            // ✅ BARU: Submit discussion + complete step together
            try {
                const { submitDiscussionPointRequest, completeStepModuleRequest } = await import("../../../assets/api.js?v=20260331-1")
                
                // 1. Submit discussion
                const discRes = await submitDiscussionPointRequest(mId, sNo, discussionPoint, token);
                if (!discRes?.success) {
                    Toast.error("Gagal submit diskusi: " + (discRes?.message || "unknown error"));
                    return;
                }
                
                // 2. Complete step
                const compRes = await completeStepModuleRequest(mId, sNo, token);
                if (compRes?.success) {
                    Toast.success("Diskusi disubmit dan step diselesaikan!");
                    // 3. Reload module
                    window.renderModuleDetail?.(mId);
                } else {
                    Toast.error("Gagal menyelesaikan step: " + (compRes?.message || "unknown error"));
                }
            } catch (err) {
                console.error("[btnCompleteDiscussionClick] Error:", err);
                Toast.error("Error: " + err.message);
            }
        });
    }

    // Attach complete-step handler
    const btnComplete = content.querySelector(".btn-complete-step");
    if (btnComplete) {
        btnComplete.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                const { completeStepModuleRequest } = await import("../../../assets/api.js");
                const res = await completeStepModuleRequest(moduleId, stepNumber, token);
                if (res && res.success) {
                    Toast.success("Step diselesaikan.");
                    // reload module detail so UI updates
                    window.renderModuleDetail?.(moduleId);
                } else {
                    Toast.error("Gagal menyelesaikan step: " + (res.message || "unknown"));
                }
            } catch (err) {
                console.error("[completeStep] error", err);
                Toast.error("Error: " + err.message);
            }
        });
    }

    // Back link handler (return to module)
    const back = content.querySelector(".back-link");
    if (back) {
        back.addEventListener("click", (e) => {
            e.preventDefault();
            loadPage("modul", { moduleId }); // assumes loadPage is global
        });
    }
}

// Helper: download resource via API (downloadStepResourceRequest returns {blob, contentType} via api.js)
async function downloadResource(moduleId, stepNumber, resourceType, token, originalName = "resource"){
    try {
        const { downloadStepResourceRequest } = await import("../../../assets/api.js");
        const result = await downloadStepResourceRequest(moduleId, stepNumber, resourceType, token);
        
        if (!result || !result.blob) {
            Toast.warning("File tidak tersedia");
            return;
        }
        
        const { blob, contentType } = result;
        
        // ✅ FIX: Improved extension detection from Content-Type header
        let extension = "bin";
        const mimeType = (contentType || blob.type || "").toLowerCase();
        
        // ✅ More accurate MIME type to extension mapping
        if (mimeType.includes("pdf")) {
            extension = "pdf";
        } else if (mimeType.includes("presentation") || mimeType.includes("presentationml")) {
            // application/vnd.openxmlformats-officedocument.presentationml.presentation
            extension = "pptx";
        } else if (mimeType.includes("wordprocessingml") || mimeType.includes("word")) {
            // application/vnd.openxmlformats-officedocument.wordprocessingml.document
            extension = "docx";
        } else if (mimeType.includes("spreadsheetml") || mimeType.includes("excel")) {
            // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
            extension = "xlsx";
        } else if (mimeType.includes("image/png")) {
            extension = "png";
        } else if (mimeType.includes("image/jpeg") || mimeType.includes("image/jpg")) {
            extension = "jpg";
        } else if (mimeType.includes("image/gif")) {
            extension = "gif";
        } else if (mimeType.includes("image/webp")) {
            extension = "webp";
        } else if (mimeType.includes("image")) {
            extension = mimeType.split("/")[1] || "jpg";
        } else if (mimeType.includes("video/mp4")) {
            extension = "mp4";
        } else if (mimeType.includes("video/webm")) {
            extension = "webm";
        } else if (mimeType.includes("video")) {
            extension = "mp4";
        } else if (mimeType.includes("text")) {
            extension = "txt";
        } else if (mimeType.includes("application/zip")) {
            extension = "zip";
        } else if (mimeType.includes("application/x-rar")) {
            extension = "rar";
        }
        
        const safeBaseName = String(originalName || "resource")
            .replace(/\.[^/.]+$/, "") // hapus extension lama
            .replace(/[\\/:*?"<>|]/g, "")
            .trim() || "resource";

        const filename = `${safeBaseName}.${extension}`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("[downloadResource] Error:", err);
        Toast.error("Gagal mengunduh file: " + (err.message || err));
    }
}

// ✅ BARU: Submit discussion point (untuk step 2)
async function submitDiscussionPoint(moduleId, stepNumber, discussionPoint, token) {
    try {
        const { submitDiscussionPointRequest } = await import("../../../assets/api.js");
        const res = await submitDiscussionPointRequest(moduleId, stepNumber, discussionPoint, token);
        
        if (res && res.success) {
            Toast.success("Diskusi berhasil disubmit!");
            // Clear textarea
            const textarea = document.querySelector("#discussion-textarea");
            if (textarea) textarea.value = "";
            // Reload module detail
            window.renderModuleDetail?.(moduleId);
        } else {
            Toast.error("Gagal submit diskusi: " + (res?.message || "unknown error"));
        }
    } catch (err) {
        console.error("[submitDiscussionPoint] Error:", err);
        Toast.error("Error: " + err.message);
    }
}

// Expose ke global scope
window.renderDaftarModul = renderDaftarModul;
window.renderModuleDetail = renderModuleDetail;
window.renderStepDetail = renderStepDetail;
window.submitDiscussionPoint = submitDiscussionPoint;