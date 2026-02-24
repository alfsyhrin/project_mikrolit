import { getUsersRequest, updateUserStatusRequest} from "./api.js";

let allUsers = []; // Simpan semua data user di sini

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
    initManajemenPengguna(); // Inisialisasi filter & search setelah render
  } catch (err) {
    container.innerHTML = "<p>Gagal mengambil data pengguna.</p>";
  }
}

function renderUsers(users) {
  const container = document.querySelector(".daftar-mahasiswa");
  container.innerHTML = users.map(user => {
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
      <article class="card-mahasiswa ${statusClass}" data-user-id="${user.id}">
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
              <p class="waktu-meta"><span class="material-symbols-outlined">calendar_month</span>${tanggal}</p>
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
}

async function attachUpdateStatusListeners() {
  const token = localStorage.getItem("token");
  const buttons = document.querySelectorAll(".btn-aksi");

  buttons.forEach(button => {
    button.addEventListener("click", async function () {
      const card = this.closest(".card-mahasiswa");
      const userId = card.dataset.userId;
      const action = this.dataset.action;
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
      }
    });
  });
}

function initManajemenPengguna() {
  const filterButtons = document.querySelectorAll(".filter-manajemen-wrapper button");
  const searchInput = document.getElementById("searchMahasiswa");
  let currentFilter = "semua";
  let currentSearch = "";

  function applyFilter() {
    let filtered = allUsers.filter(user => {
      // Filter status
      let cocokStatus =
        currentFilter === "semua" ||
        (currentFilter === "diterima" && (user.status === "diterima" || user.status === "approved")) ||
        (currentFilter === "pending" && user.status === "pending") ||
        (currentFilter === "ditolak" && (user.status === "ditolak" || user.status === "rejected"));

      // Filter search
      let nama = user.name?.toLowerCase() || "";
      let npm = user.nidn?.toLowerCase() || "";
      let cocokSearch = nama.includes(currentSearch) || npm.includes(currentSearch);

      return cocokStatus && cocokSearch;
    });

    renderUsers(filtered);
    attachUpdateStatusListeners(); // Re-attach listeners setelah render ulang
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

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Cek apakah halaman manajemen pengguna sedang aktif
  if (window.location.pathname.endsWith("dashboard.html") &&
      document.querySelector(".daftar-mahasiswa")) {
    fetchAndRenderUsers();
  }
});

export { fetchAndRenderUsers, initManajemenPengguna };