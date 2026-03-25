document.addEventListener("click", function (e) {

    const btn = e.target.closest("#btnFullscreenDiskusi");
    if (!btn) return;

    const container = document.querySelector(".container-diskusi");

    container.classList.toggle("fullscreen");

    // ganti icon
    const icon = btn.querySelector("span");

    if (container.classList.contains("fullscreen")) {
        icon.innerText = "close_fullscreen";
    } else {
        icon.innerText = "fullscreen";
    }

});