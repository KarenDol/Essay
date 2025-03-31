document.addEventListener('DOMContentLoaded', () => {
    const iin = document.getElementById('iin');
    const phone = document.getElementById('phone');

    iin.addEventListener('input', () => {
        iin.value = iin.value.replace(/[^0-9]/g, '');
        iin.value = iin.value.replace(/\B(?=(\d{6})+(?!\d))/g, ' '); // Add spaces for better visibility
    });

    var maskOptions = {
        mask: '+7 (000) 000-00-00',
        lazy: false
    }

    const phoneMask = new IMask(phone, maskOptions);

    function isPhone(phone) {
        return /^\+?(\d.*){11,}$/.test(phone);
    }

    const buttonBack = document.getElementById('button_cancel');
    buttonBack.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = '/login';
    });
});