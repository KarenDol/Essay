document.addEventListener('DOMContentLoaded', () => {
    const passwdInput = document.getElementById('passwd');

    passwdInput.addEventListener('input', () => {
        const length = passwdInput.value.length;
        const dots = '●'.repeat(length);
        passwdInput.style.fontFamily = 'Arial'; // Ensure consistent rendering
        passwdInput.style.letterSpacing = '1px';

        // Store actual password in a data attribute
        if (!passwdInput.dataset.actualValue) {
            passwdInput.dataset.actualValue = '';
        }

        passwdInput.dataset.actualValue = passwdInput.value;
        passwdInput.value = dots;
    });

    passwdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            passwdInput.dataset.actualValue = passwdInput.dataset.actualValue.slice(0, -1);
        }
    });

    passwdInput.addEventListener('focus', () => {
        passwdInput.value = passwdInput.dataset.actualValue || '';
    });

    passwdInput.addEventListener('blur', () => {
        const length = passwdInput.value.length;
        passwdInput.value = '●'.repeat(length);
    });
});