class ModalComponent {

    constructor() {
        this.createModal();
    }

    createModal() {
        this.overlay = document.createElement("div");
        this.overlay.className = "modal-overlay";

        this.overlay.innerHTML = `
            <div class="modal-box medium">
                <div class="modal-header">
                    <div class="modal-title"></div>
                    <button class="modal-close">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        this.modalBox = this.overlay.querySelector(".modal-box");
        this.titleEl = this.overlay.querySelector(".modal-title");
        this.bodyEl = this.overlay.querySelector(".modal-body");
        this.actionsEl = this.overlay.querySelector(".modal-actions");
        this.closeBtn = this.overlay.querySelector(".modal-close");

        // Close events
        this.closeBtn.onclick = () => this.hide();

        this.overlay.addEventListener("click", (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.hide();
            }
        });
    }

    show(options = {}) {
        const {
            title = "",
            content = "",
            size = "medium", // small | medium | large
            confirmText = null,
            cancelText = null,
            onConfirm = null
        } = options;

        // Set size
        this.modalBox.classList.remove("small", "medium", "large");
        this.modalBox.classList.add(size);

        this.titleEl.innerText = title;
        this.bodyEl.innerHTML = "";

        if (typeof content === "string") {
            this.bodyEl.innerHTML = content;
        } else {
            this.bodyEl.appendChild(content);
        }

        this.actionsEl.innerHTML = "";

        if (cancelText) {
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "modal-btn cancel";
            cancelBtn.innerText = cancelText;
            cancelBtn.onclick = () => this.hide();
            this.actionsEl.appendChild(cancelBtn);
        }

        if (confirmText) {
            const confirmBtn = document.createElement("button");
            confirmBtn.className = "modal-btn confirm";
            confirmBtn.innerText = confirmText;
            confirmBtn.onclick = async () => {
                if (onConfirm) {
                    try {
                        await onConfirm();
                    } catch (e) {
                        console.error(e);
                    }
                }
                this.hide();
            };

            this.actionsEl.appendChild(confirmBtn);
        }

        this.overlay.classList.add("active");
    }

    alert(message, title = "Informasi") {
        this.show({
            title,
            content: `<p>${message}</p>`,
            confirmText: "OK"
        });
    }

    hide() {
        this.overlay.classList.remove("active");
    }
}

const Modal = new ModalComponent();
export default Modal;