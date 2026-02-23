// assets/js/manajemen-pengguna.js

function initManajemenPengguna() {
  const filterButtons = document.querySelectorAll(".filter-manajemen-wrapper button");
  const cards = document.querySelectorAll(".card-mahasiswa");
  const searchInput = document.getElementById("searchMahasiswa");

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