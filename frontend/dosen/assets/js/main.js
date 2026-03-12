import Modal from "../../../assets/modal.js";

// Awal Modal Buat Tugas di Halaman Manajemen Tugas (Dosen)
document.addEventListener("click", function (e) {
    const buatTugasBtn = e.target.closest("#btnBuatTugas");
    if (buatTugasBtn && window.showCreateTaskModal) {
        window.showCreateTaskModal(); // panggil function dari manajemen-tugas.js
        return;
    }
});

// Akhir Modal Buat Tugas di Halaman Manajemen Tugas (Dosen)

// // Awal modal edit tugas di halaman manajemen tugas (Dosen)
// document.addEventListener("click", function (e) {
//     const buatTugasBtn = e.target.closest("#btnEditTugas");
//     if (buatTugasBtn) {
//         Modal.show({
//             title: "Edit Tugas",
//             size: "large",
//             content: `
//                 <form id="formTugas" class="modal-form">
                    
//                     <div class="modal-form-group">
//                         <label>Judul Tugas</label>
//                         <input type="text" name="judul">
//                     </div>

//                     <div class="modal-form-group">
//                         <label>Deskripsi</label>
//                         <textarea name="deskripsi"></textarea>
//                     </div>

//                     <div class="modal-form-row">
//                         <div class="modal-form-group">
//                             <label>Sintaks</label>
//                             <select name="sintaks">
//                                 <option>Lit-Starter</option>
//                                 <option>Lit-Advanced</option>
//                             </select>
//                         </div>

//                         <div class="modal-form-group">
//                             <label>Deadline</label>
//                             <input type="date" name="deadline">
//                         </div>
//                     </div>

//                     <div class="modal-form-group">
//                         <label>Lampiran (opsional)</label>
//                         <div class="input-file-wrapper" onclick="document.getElementById('lampiran').click()">
//                             <span class="material-symbols-outlined upload-icon">upload</span>
//                             <span class="file-label">Klik untuk memilih file</span>
//                             <span class="file-types">PDF, DOC, DOCX, PPT, ZIP</span>
//                             <span class="file-name" id="fileName"></span>
//                         </div>
//                         <input type="file" name="lampiran" id="lampiran" 
//                                 accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" 
//                                 style="display:none;">
//                     </div>

//                     <button type="submit" class="modal-submit-btn">
//                         Simpan Perubahan
//                     </button>

//                 </form>
//             `
//         });
//         return; // stop supaya tidak lanjut ke kondisi lain
//     }
// });

document.addEventListener("submit", function (e) {
    if (e.target.id === "formTugas") {
        e.preventDefault();

        const formData = new FormData(e.target);

        const data = {
            judul: formData.get("judul"),
            deskripsi: formData.get("deskripsi"),
            sintaks: formData.get("sintaks"),
            deadline: formData.get("deadline"),
            lampiran: formData.get("lampiran")
        };

        console.log("Data tugas:", data);

        // Di sini bisa kamu kirim ke backend pakai fetch()

        Modal.hide();
    }
});
// Akhir modal edit tugas di halaman manajemen tugas (Dosen)

// Awal modal list mahasiswa yang mengumpulkan tugas (Mahasiswa)
document.addEventListener("click", function (e) {
    const btnSubmisi = e.target.closest("#btnLihatSubmisi");

    if (!btnSubmisi) return;

    Modal.show({
        title: "Submisi Mahasiswa",
        size: "medium",
        content: `
            <div class="submission-card-wrapper">

            </div>
            <button type="download" class="modal-download-btn">
                Download ZIP
            </button>
        `
    });
});
// Akhir modal list mahasiswa yang mengumpulkan tugas (Mahasiswa)

// Awal modal buat modul
document.addEventListener("click", function (e) {

    const btnBuatModul = e.target.closest("#btnBuatModul");

    if (!btnBuatModul) return;

    Modal.show({
        title: "Buat Modul Pembelajaran",
        size: "large",
        content: `
        <form id="formBuatModul" class="modal-form">

            <!-- JUDUL -->
            <div class="modal-form-group">
                <label>Judul Modul</label>
                <input type="text" name="judul_modul" required>
            </div>

            <!-- DESKRIPSI -->
            <div class="modal-form-group">
                <label>Deskripsi Modul</label>
                <textarea name="deskripsi_modul" rows="3"></textarea>
            </div>

            <!-- TUJUAN -->
            <div class="modal-form-group">

                <label>Tujuan Pembelajaran</label>

                <div id="tujuanContainer">

                    <div class="tujuan-item">
                        <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran 1">
                    </div>

                    <div class="tujuan-item">
                        <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran 2">
                    </div>

                    <div class="tujuan-item">
                        <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran 3">
                    </div>

                </div>

                <button type="button" id="btnTambahTujuan" class="btn-tambah-tujuan">
                    <span class="material-symbols-outlined">add</span>
                    Tambah Tujuan
                </button>

            </div>

            <!-- ================= STEP 1 ================= -->

            <div class="step-modul">
                <h3>STEP 1 — Microlearning</h3>

                <div class="modal-form-group">
                    <label>Link Video Microlearning (±5 menit)</label>
                    <input type="url" name="video_microlearning" placeholder="https://youtube.com/...">
                </div>

                <div class="modal-form-group">
                    <label>Dokumen Contoh Penelitian</label>
                    <input type="file" name="dokumen_penelitian">
                </div>
            </div>

            <!-- ================= STEP 2 ================= -->

            <div class="step-modul">
                <h3>STEP 2 — Diskusi</h3>

                <div class="modal-form-group">
                    <label>Upload File PPT</label>
                    <input type="file" name="file_ppt">
                </div>

                <div class="modal-form-group">
                <label>Aktivitas Diskusi</label>

                <label class="diskusi-card">

                    <input type="checkbox" name="diskusi_rangkuman">

                    <div class="diskusi-card-content">

                        <span class="material-symbols-outlined icon-diskusi">
                            forum
                        </span>

                        <div class="diskusi-info">
                            <h4>Catat Poin Penting</h4>
                            <p>Buat rangkuman atau poin penting dari materi PPT</p>
                        </div>

                        <span class="material-symbols-outlined check-icon">
                            check_circle
                        </span>

                    </div>

                </label>

            </div>

            </div>

            <!-- ================= STEP 3 ================= -->

            <div class="step-modul">
                <h3>STEP 3 — Infografis</h3>

                <div class="modal-form-group">
                    <label>Upload Infografis 1</label>
                    <input type="file" name="infografis1">
                </div>

                <div class="modal-form-group">
                    <label>Upload Infografis 2</label>
                    <input type="file" name="infografis2">
                </div>

            </div>

            <button type="submit" class="modal-submit-btn">
                Simpan Modul
            </button>

        </form>
        `
    });

});


/* =========================
   TAMBAH TUJUAN
========================= */

document.addEventListener("click", function (e) {

    const btnTambah = e.target.closest("#btnTambahTujuan");

    if (!btnTambah) return;

    const container = document.getElementById("tujuanContainer");

    if (!container) return;

    const jumlah = container.children.length + 1;

    const div = document.createElement("div");

    div.className = "tujuan-item";

    div.innerHTML = `
        <input type="text" name="tujuan[]" placeholder="Tujuan pembelajaran ${jumlah}">
        <button type="button" class="hapus-tujuan">
            <span class="material-symbols-outlined">delete</span>
        </button>
    `;

    container.appendChild(div);

});


/* =========================
   HAPUS TUJUAN
========================= */

document.addEventListener("click", function (e) {

    const btnHapus = e.target.closest(".hapus-tujuan");

    if (!btnHapus) return;

    const container = document.getElementById("tujuanContainer");

    if (!container) return;

    if (container.children.length <= 3) {
        alert("Minimal harus ada 3 tujuan pembelajaran.");
        return;
    }

    btnHapus.closest(".tujuan-item").remove();

});


/* =========================
   SUBMIT FORM MODUL
========================= */

document.addEventListener("submit", function (e) {

    if (e.target.id !== "formBuatModul") return;

    e.preventDefault();

    const formData = new FormData(e.target);

    const data = {
        judul: formData.get("judul_modul"),
        deskripsi: formData.get("deskripsi_modul"),
        tujuan: formData.getAll("tujuan[]"),

        video: formData.get("video_microlearning"),
        dokumenPenelitian: formData.get("dokumen_penelitian"),

        filePPT: formData.get("file_ppt"),
        diskusi: formData.get("diskusi_rangkuman"),

        infografis1: formData.get("infografis1"),
        infografis2: formData.get("infografis2")
    };

    console.log("Data Modul:", data);

    // contoh kirim ke backend
    /*
    fetch("/api/modul",{
        method:"POST",
        body:formData
    })
    */

    Modal.hide();

});
// Akhir modal buat modul