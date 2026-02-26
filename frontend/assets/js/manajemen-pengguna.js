import { getUsersRequest, updateUserStatusRequest } from "./api.js";

let allUsers = [];

async function fetchAndRenderUsers() {
  const container = document.querySelector(".daftar-mahasiswa");
  const token = localStorage.getItem("token");
  if (!container) return;

  try {
    allUsers = await getUsersRequest(token);

    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      container.innerHTML = "<p>Tidak ada data mahasiswa.</p>";
      return;
    }

    renderUsers(allUsers);
    initManajemenPengguna();
  } catch (err) {
    container.innerHTML = "<p>Gagal mengambil data pengguna.</p>";
  }
}

function renderUsers(users) {
  const container = document.querySelector(".daftar-mahasiswa");

  const html = users.map(user => {
    let statusClass = "";
    let statusLabel = "";
    if (user.status === "pending") {
      statusClass = "status-pending";
      statusLabel = "Pending";
    } else if (user.status === "diterima" || user.status === "approved") {
      statusClass = "status-diterima";
      statusLabel = "Diterima";
    } else if (user.status === "ditolak" || user.status === "rejected") {
      statusClass = "status-ditolak";
      statusLabel = "Ditolak";
    } else {
      statusClass = "status-pending";
      statusLabel = user.status;
    }

    const tanggal = user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-";

    return `
      <article class="card-mahasiswa ${statusClass} card-fade-in" data-user-id="${user.id}">
        <div class="card-mahasiswa-header">
          <div class="card-mahasiswa-profil">
            <div class="avatar-mahasiswa">
              <span class="avatar-inisial material-symbols-outlined">person</span>
            </div>
            <div class="info-mahasiswa">
              <h3 class="nama-mahasiswa">${user.name}</h3>
              <p class="meta-mahasiswa">
                <span class="npm-mahasiswa">${user.nidn}</span>
                <span class="separator-meta">-</span>
                <span class="email-mahasiswa">${user.email}</span>
              </p>
              <p class="waktu-meta"><span class="material-symbols-outlined"></span>${tanggal}</p>
            </div>
          </div>
          <span class="badge-status">${statusLabel}</span>
        </div>
        <div class="card-mahasiswa-body">
          ${
            user.status === "pending"
            ? `<div class="aksi-mahasiswa">
                <button class="btn-aksi btn-terima" data-action="terima">
                  <span class="material-symbols-outlined">check_circle</span>
                  Terima
                </button>
                <button class="btn-aksi btn-tolak" data-action="tolak">
                  <span class="material-symbols-outlined">cancel</span>
                  Tolak
                </button>
              </div>`
            : ""
          }
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = html;

  // Trigger reflow untuk menjalankan animasi fade-in
  void container.offsetHeight;
}

function initManajemenPengguna() {
  const filterButtons = document.querySelectorAll(".filter-manajemen-wrapper button");
  const searchInput = document.getElementById("searchMahasiswa");
  let currentFilter = "semua";
  let currentSearch = "";

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

  function applyFilter() {
  let filtered = allUsers.filter(user => {
    let cocokStatus =
      currentFilter === "semua" ||
      (currentFilter === "diterima" && (user.status === "diterima" || user.status === "approved")) ||
      (currentFilter === "pending" && user.status === "pending") ||
      (currentFilter === "ditolak" && (user.status === "ditolak" || user.status === "rejected"));

    let nama = user.name?.toLowerCase() || "";
    let npm = user.nidn?.toLowerCase() || "";
    let cocokSearch = nama.includes(currentSearch) || npm.includes(currentSearch);

    return cocokStatus && cocokSearch;
  });

  const allCards = document.querySelectorAll(".card-mahasiswa");
  const filteredIds = filtered.map(u => u.id);

  allCards.forEach(card => {
    const userId = parseInt(card.dataset.userId);
    const shouldShow = filteredIds.includes(userId);

    if (shouldShow) {
      // Tampilkan: lepas .hide dan .hidden
      card.classList.remove("hide");
      setTimeout(() => card.classList.remove("hidden"), 10); // biar transisi masuk juga smooth
    } else {
      // Sembunyikan: tambah .hide, lalu setelah transisi selesai, tambah .hidden
      if (!card.classList.contains("hide")) {
        card.classList.add("hide");
        setTimeout(() => card.classList.add("hidden"), 300); // 300ms = waktu transisi CSS
      }
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

// ✅ GUNAKAN EVENT DELEGATION (1 listener untuk semua tombol)
function attachUpdateStatusListeners() {
  const container = document.querySelector(".daftar-mahasiswa");
  const token = localStorage.getItem("token");

  // Hapus listener lama jika ada
  container.removeEventListener("click", handleButtonClick);

  // Handler function
  async function handleButtonClick(e) {
    // Cek apakah yang diklik adalah tombol .btn-aksi
    const button = e.target.closest(".btn-aksi");
    if (!button) return;

    const card = button.closest(".card-mahasiswa");
    const userId = card.dataset.userId;
    const action = button.dataset.action;
    const status = action === "terima" ? "diterima" : "ditolak";

    console.log("Updating user:", userId, "to status:", status);

    try {
      const response = await updateUserStatusRequest(userId, status, token);
      if (response.message) {
        alert(response.message);
        fetchAndRenderUsers(); // Refresh data setelah update status
      } else {
        alert("Gagal memperbarui status pengguna.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memperbarui status pengguna.");
      console.error(err);
    }
  }

  // Tambahkan listener sekali saja ke container
  container.addEventListener("click", handleButtonClick);
}

async function fetchAndRenderUsersWithListeners() {
  await fetchAndRenderUsers();
  attachUpdateStatusListeners(); // ✅ Attach listener hanya sekali
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("dashboard.html") &&
      document.querySelector(".daftar-mahasiswa")) {
    fetchAndRenderUsersWithListeners();
  }
});

export { fetchAndRenderUsersWithListeners as fetchAndRenderUsers, initManajemenPengguna };