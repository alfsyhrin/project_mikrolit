class ToastComponent {

    constructor() {
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement("div");
        this.container.className = "toast-container";
        document.body.appendChild(this.container);
    }

    show(options = {}) {
        const {
            message = "",
            type = "info", // success | error | warning | info
            duration = 3000
        } = options;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;

        let icon = "info";

        if (type === "success") icon = "check_circle";
        if (type === "error") icon = "error";
        if (type === "warning") icon = "warning";

        toast.innerHTML = `
            <div class="toast-icon">
                <span class="material-symbols-outlined">${icon}</span>
            </div>

            <div class="toast-message">
                ${message}
            </div>

            <button class="toast-close">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        this.container.appendChild(toast);

        // trigger animation
        setTimeout(() => {
            toast.classList.add("show");
        }, 10);

        // close button
        toast.querySelector(".toast-close").onclick = () => {
            this.removeToast(toast);
        };

        // auto hide
        if (duration) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }
    }

    removeToast(toast) {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    success(message) {
        this.show({ message, type: "success" });
    }

    error(message) {
        this.show({ message, type: "error" });
    }

    warning(message) {
        this.show({ message, type: "warning" });
    }

    info(message) {
        this.show({ message, type: "info" });
    }
}

const Toast = new ToastComponent();
export default Toast;