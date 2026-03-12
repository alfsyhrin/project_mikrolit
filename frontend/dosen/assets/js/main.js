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