import Modal from "../../../assets/modal.js";

// Awal Modal Buat Tugas di Halaman Manajemen Tugas (Dosen)
document.addEventListener("click", function (e) {


    const buatTugasBtn = e.target.closest("#btnUploadTugas");

    if (buatTugasBtn) {

        Modal.show({
            title: "Kumpulkan Tugas",
            size: "large",
            content: `
                <form id="formUploadTugas" class="modal-form">
                    <div class="modal-form-group desc">
                        <h3>Tugas</h3>
                        <p>Deadline: 10/04/2026</p>
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
                        <textarea name="catatan" required></textarea>
                    </div>


                    <button type="submit" class="modal-submit-btn">
                        Kirim Tugas
                    </button>

                </form>
            `
        });

        return; // stop supaya tidak lanjut ke kondisi lain
    }

});

document.addEventListener("submit", function (e) {

    if (e.target.id === "formUploadTugas") {

        e.preventDefault();

        const formData = new FormData(e.target);

        const data = {
            judul: formData.get("judul"),
            deskripsi: formData.get("catatan"),
            deadline: formData.get("deadline"),
            lampiran: formData.get("lampiran")
        };

        console.log("Data tugas:", data);

        // Di sini bisa kamu kirim ke backend pakai fetch()

        Modal.hide();
    }

});
// Akhir Modal Buat Tugas di Halaman Manajemen Tugas (Dosen)

