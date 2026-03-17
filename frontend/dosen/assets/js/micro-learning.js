import { createModuleRequest, uploadModuleResourcesRequest } from "../../../assets/api";

// Fungsi untuk upload file
async function handleFileUpload(inputElement, token) {
    const file = inputElement.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await uploadModuleResourcesRequest(formData, token);
        if (response.success) {
            // Simpan path file ke localStorage
            const key = `modul_resource_path_${inputElement.name}`;
            localStorage.setItem(key, response.path);

            // Tampilkan nama file di form (opsional)
            const fileNameElement = inputElement.closest(".modal-form-group").querySelector(".file-name");
            if (fileNameElement) fileNameElement.textContent = file.name;

            console.log(`File ${file.name} berhasil di-upload: ${response.path}`);
        } else {
            alert(`Gagal upload file: ${response.message}`);
        }
    } catch (error) {
        console.error("Error saat upload file:", error);
        alert("Terjadi kesalahan saat upload file.");
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

    // Susun body request
    const body = {
        title: formData.get("judul_modul"),
        description: formData.get("deskripsi_modul"),
        learning_outcomes: "Mahasiswa memahami ideologi media", // Ambil dari form jika ada
        discussion_enabled: !!formData.get("gunakan_forum"),
        created_by: 1, // Ambil dari user login jika perlu
        objectives: formData.getAll("tujuan[]"),
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
        const response = await createModuleRequest(body, token);
        if (response.success) {
            alert("Modul berhasil dibuat!");
            Modal.hide(); // Tutup modal
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