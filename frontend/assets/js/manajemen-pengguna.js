// assets/js/manajemen-pengguna.js

function initManajemenPengguna() {
  const filterButtons = document.querySelectorAll(".filter-manajemen-wrapper button");
  const cards = document.querySelectorAll(".card-mahasiswa");

  if (!filterButtons.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", function () {

      // reset active
      filterButtons.forEach(btn => btn.classList.remove("active-filter"));
      this.classList.add("active-filter");

      const filter = this.dataset.filter;

      cards.forEach(card => {
        const isDiterima = card.classList.contains("status-diterima");
        const isPending  = card.classList.contains("status-pending");
        const isDitolak  = card.classList.contains("status-ditolak");

        if (filter === "semua") {
          card.style.display = "flex";
        } 
        else if (filter === "diterima" && isDiterima) {
          card.style.display = "flex";
        } 
        else if (filter === "pending" && isPending) {
          card.style.display = "flex";
        } 
        else if (filter === "ditolak" && isDitolak) {
          card.style.display = "flex";
        } 
        else {
          card.style.display = "none";
        }
      });

    });
  });
}