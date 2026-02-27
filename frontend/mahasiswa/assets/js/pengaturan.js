function initPengaturan() {
    const filters = document.querySelectorAll(".filter-pengaturan");
    const containers = document.querySelectorAll(".profile-container, .password-container");

    filters.forEach(filter => {
        filter.addEventListener("click", function () {

            const target = this.getAttribute("data-target");

            // Jika sudah aktif, jangan animasi ulang
            if (this.classList.contains("active")) return;

            // Reset active
            filters.forEach(f => f.classList.remove("active"));
            this.classList.add("active");

            // Hide semua dulu
            containers.forEach(c => {
                c.classList.add("sembunyi");
            });

            // Delay kecil agar transisi rapi
            setTimeout(() => {
                document.getElementById(target).classList.remove("sembunyi");
            }, 50);
        });
    });
}