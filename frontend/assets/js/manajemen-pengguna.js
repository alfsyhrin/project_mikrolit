// assets/js/manajemen-pengguna.js

function initManajemenPengguna() {
  const filterButtons = document.querySelectorAll(".filter-manajemen-wrapper button");
  const cards = document.querySelectorAll(".card-mahasiswa");
  const searchInput = document.getElementById("searchMahasiswa");
  const exportBtn = document.querySelector(".export-excel");

  if (exportBtn) {
    exportBtn.addEventListener("click", function () {

      const visibleCards = document.querySelectorAll(".card-mahasiswa:not(.hide)");

      if (!visibleCards.length) {
        alert("Tidak ada data untuk diexport.");
        return;
      }

      const data = [];

      // Header
      data.push(["Nama", "NPM", "Email", "Status", "Tanggal"]);

      // Ambil data dari card yang terlihat
      visibleCards.forEach(card => {
        const nama = card.querySelector(".nama-mahasiswa")?.innerText.trim();
        const npm = card.querySelector(".npm-mahasiswa")?.innerText.trim();
        const email = card.querySelector(".email-mahasiswa")?.innerText.trim();
        const status = card.querySelector(".badge-status")?.innerText.trim();
        const tanggal = card.querySelector(".waktu-meta")?.innerText.trim();

        data.push([nama, npm, email, status, tanggal]);
      });

      // Buat worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Buat workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Mahasiswa");

      // Auto width kolom
      const colWidths = data[0].map((_, colIndex) => ({
        wch: Math.max(...data.map(row => row[colIndex]?.length || 10)) + 2
      }));
      worksheet["!cols"] = colWidths;

      // Nama file dengan tanggal
      const today = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `Data_Mahasiswa_${today}.xlsx`);
    });
  }

  if (!filterButtons.length) return;

  let currentFilter = "semua";
  let currentSearch = "";

  function applyFilter() {
    cards.forEach(card => {
      const nama = card.querySelector(".nama-mahasiswa").innerText.toLowerCase();
      const npm = card.querySelector(".npm-mahasiswa").innerText.toLowerCase();

      const cocokSearch =
        nama.includes(currentSearch) || npm.includes(currentSearch);

      const cocokStatus =
        currentFilter === "semua" ||
        (currentFilter === "diterima" && card.classList.contains("status-diterima")) ||
        (currentFilter === "pending" && card.classList.contains("status-pending")) ||
        (currentFilter === "ditolak" && card.classList.contains("status-ditolak"));

      if (cocokSearch && cocokStatus) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });
  }

  // FILTER CLICK
  filterButtons.forEach(button => {
    button.addEventListener("click", function () {
      filterButtons.forEach(btn => btn.classList.remove("active-filter"));
      this.classList.add("active-filter");

      currentFilter = this.dataset.filter;
      applyFilter();
    });
  });

  // SEARCH INPUT
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentSearch = this.value.toLowerCase();
      applyFilter();
    });
  }
}