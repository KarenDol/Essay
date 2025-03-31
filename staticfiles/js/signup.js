document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mainForm');
    const lastname = document.getElementById('lastname');
    const firstname = document.getElementById('firstname');
    const iin = document.getElementById('iin');
    const grade = document.getElementById('grade');
    const phone = document.getElementById('phone');
    const phoneLabel = document.getElementById('phone-label');
    let wa_exists = false; //WA validation
    const pin = document.getElementById('pin');
    const button_submit = document.getElementById('button_submit');

    lastname.addEventListener('input', () => {
        lastname.value = lastname.value.replace(/[^a-zA-Zа-яА-ЯёЁәңғүұқөһӘҢҒҮҰҚӨҺ-]/g, '');
    });

    firstname.addEventListener('input', () => {
        firstname.value = firstname.value.replace(/[^a-zA-Zа-яА-ЯёЁәңғүұқөһӘҢҒҮҰҚӨҺ-]/g, '');
    });

    iin.addEventListener('input', () => {
        iin.value = iin.value.replace(/[^0-9]/g, '');
        iin.value = iin.value.replace(/\B(?=(\d{6})+(?!\d))/g, ' '); // Add spaces for better visibility
    });

    grade.addEventListener('input', () => {
        grade.value = grade.value.replace(/[^0-9]/g, '');
    });

    phone.addEventListener('input', existsWhatsapp);

    var maskOptions = {
        mask: '+7 (000) 000-00-00',
        lazy: false
    }

    const phoneMask = new IMask(phone, maskOptions);

    function checkInputs() {
        let isValid = true;
        validateField(lastname, lastname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(firstname, firstname.value.trim() !== '', 'Это поле не может быть пустым');
        validateField(iin, iin.value.trim().length == 13, 'Это поле не может быть пустым');
        validateField(grade, (grade.value>0 && grade.value<13), 'Это поле не может быть пустым');
        validateField(phone, wa_exists, 'Неверный номер телефона');

        // Ensure class selection is valid
        if (!validateClassSelection()) {
            isValid = false;
        }

        document.querySelectorAll('.form-control').forEach((control) => {
            if (control.classList.contains('error')) {
                isValid = false;
            }
        });

        return isValid;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        
        if (checkInputs()) {
            sendPinCode(phone.value).then(sentPIN => {
                //Unveil the PIN code section
                pin.style.display = 'block';

                button_submit.addEventListener('click', (event) => {
                    event.preventDefault();

                    if (comparePin(sentPIN)){
                        form.submit();
                    }
                }); 
            });
        }
    });

    //Check if WhatsApp exists
    function existsWhatsapp() {
        if (isPhone(phone.value)) {
            fetch(`/wa_exists/${phone.value}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.existsWhatsapp) {
                    phoneLabel.innerText = "Номер Телефона | WhatsApp доступен";
                    wa_exists = true;
                } else {
                    phoneLabel.innerText = "Номер Телефона | WhatsApp не доступен";
                    wa_exists = false;
                }
            })
            .catch(error => {
                // Handle errors
                console.error('Error:', error);
                alert('Произошла ошибка!');
            });
        }
        else{
            phoneLabel.innerText = "Номер Телефона";
        }
    }

    function validateField(input, condition, errorMessage) {
        if (condition) {
            setSuccess(input);
        } else {
            setError(input, errorMessage);
        }
    }

    function setError(input, message) {
        const formControl = input.parentElement;
        const icon = formControl.querySelector('.icon');
        formControl.className = 'form-control error';
        icon.className = 'icon fas fa-times-circle';
        input.placeholder = message;
    }

    function setSuccess(input) {
        const formControl = input.parentElement;
        const icon = formControl.querySelector('.icon');
        formControl.className = 'form-control success';
        icon.className = 'icon fas fa-check-circle';
    }

    function isPhone(phone) {
        return /^\+?(\d.*){11,}$/.test(phone);
    }

    const selectMenu = document.querySelector('.select-menu');
    const optionMenu = document.querySelector(".select-menu"),
    selectBtn = optionMenu.querySelector(".select-btn"),
    options = optionMenu.querySelectorAll(".option"),
    sBtn_text = optionMenu.querySelector(".sBtn-text");

    selectBtn.addEventListener("click", () => {
        if (optionMenu.classList.contains("active")) {
            optionMenu.classList.remove("active");
            let optionsContainer = optionMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 1, visibility: "visible" },
                { opacity: 0, visibility: "hidden" }
            ], {
                duration: 150,
                fill: "forwards"
            });
        } else {
            optionMenu.classList.add("active");
            let optionsContainer = optionMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 0, visibility: "hidden" },
                { opacity: 1, visibility: "visible" }
            ], {
                duration: 150,
                fill: "forwards"
            });
        }
    });

    options.forEach(option => {
        option.addEventListener("click", () => {
            let selectedOption = option.querySelector(".option-text").innerText;
            sBtn_text.innerText = selectedOption;
            selectedPosition.value = selectedOption;
            if (selectedPosition.value === 'Басқа'){
                selectedPosition.type = 'text'; //Unhidden the input
                selectedPosition.value = '';
                selectedPosition.placeholder = 'Ex.: Тренер по йоге...';
                selectedPosition.style.width = '70%';
                selectMenu.style.width = '30%';
            }
            else{
                // Revalidate class selection after updating the value
                validateClassSelection();
            }
            
            let optionsContainer = optionMenu.querySelector(".options");
            optionsContainer.animate([
                { opacity: 1, visibility: "visible" },
                { opacity: 0, visibility: "hidden" }
            ], {
                duration: 100,
                fill: "forwards"
            });

            optionMenu.classList.remove("active");
        })
    });

    function validateClassSelection() {
        if (selectedPosition.value.trim() === '') {
            selectMenu.classList.add('error');
            selectMenu.classList.remove('success');
            if (sBtn_text.innerText==='Другое'){
                selectedPosition.classList.add('error');
                selectedPosition.classList.remove('success');
                selectedPosition.style.borderColor = '#e74d3cb0';
                selectedPosition.placeholder = 'Уточните позицию';
            }
            return false;
        } else {
            selectMenu.classList.add('success');
            selectMenu.classList.remove('error');
            if (sBtn_text.innerText==='Другое'){
                selectedPosition.classList.add('success');
                selectedPosition.classList.remove('error');
                selectedPosition.style.borderColor = '#28bb65e3';
            }
            return true; 
        }
    }

    const buttonBack = document.getElementById('button_cancel');
    buttonBack.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = '/login';
    });

    //PIN code logic
    function sendPinCode(phone) {
        return fetch(`/wa_PIN/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: JSON.stringify({ phone: phone }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                return data.pin;
                // You can handle the PIN here, like displaying it on the page
            } else {
                console.error('Error sending PIN:', data.message);
            }
        })
        .catch(error => {
            console.error('Request failed', error);
        });
    }

    const inputs = document.querySelectorAll('.digit-group input');

    inputs.forEach((input) => {
        input.setAttribute('maxlength', 1);

        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
            e.target.value = value;

            if (value && input.dataset.next) {
                document.getElementById(input.dataset.next)?.focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && !input.value && input.dataset.previous) {
                document.getElementById(input.dataset.previous)?.focus();
            }
        });
    });

    function getEnteredPin() {
        const pin = Array.from(document.querySelectorAll('.digit-group input'))
            .map(input => input.value)
            .join('');
        return pin;
    }
    
    function allInputsFilled() {
        return Array.from(document.querySelectorAll('.digit-group input')).every(input => input.value.length === 1);
    }
    
    function comparePin(sentPin) {
        if (!allInputsFilled()) {
            alert('Please fill in all PIN fields.');
            return false;
        }

        const enteredPin = getEnteredPin();
        if (String(enteredPin) === String(sentPin)) {
            return true;
        } else {
            alert('PIN codes did not match');
            return false;
        }
    } 
});