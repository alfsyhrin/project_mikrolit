function initTogglePassword() {
    const wrappers = document.querySelectorAll('.password-wrapper');

    wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('input');
        const icon = wrapper.querySelector('.toggle-password');

        // cegah double binding (penting di SPA)
        if (!input || !icon || icon.dataset.initialized) return;

        icon.addEventListener('click', () => {
            const isPassword = input.type === 'password';

            input.type = isPassword ? 'text' : 'password';
            icon.textContent = isPassword ? 'visibility_off' : 'visibility';
        });

        icon.dataset.initialized = "true";
    });
}

export default {
    init: initTogglePassword
};