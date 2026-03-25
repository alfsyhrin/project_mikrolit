export function initDiskusiFullscreen() {
    const btn = document.getElementById("btnFullscreenDiskusi");
    const container = document.getElementById("containerDiskusi");

    if (!btn || !container) return;

    let isFullscreen = false;

    btn.addEventListener("click", () => {
        isFullscreen = !isFullscreen;

        if (isFullscreen) {
            container.classList.add("fullscreen");

            btn.innerHTML = `
                <span class="material-symbols-outlined">close_fullscreen</span>
            `;

            // Optional: disable scroll body
            document.body.style.overflow = "hidden";
        } else {
            container.classList.remove("fullscreen");

            btn.innerHTML = `
                <span class="material-symbols-outlined">open_in_full</span>
            `;

            document.body.style.overflow = "auto";
        }
    });
}