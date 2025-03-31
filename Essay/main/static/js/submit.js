document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mainForm');
    const toggle = document.getElementById('toggle');
    const textSection = document.getElementById('text-section');
    const fileSection = document.getElementById('file-section');
    const textInput = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const file_name = document.getElementById('file_name');

    const editor = new Quill('#editor', {
        theme: 'snow'
    });

    //File input isn't available by default
    fileSection.style.display = 'none';

    toggle.addEventListener('change', () => {
        if (toggle.checked){
            textSection.style.display = 'none';
            fileSection.style.display = 'block';
        } else {
            textSection.style.display = 'block';
            fileSection.style.display = 'none';
        }
    });

    let fileValid = false;
    fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];
        const maxSize = 10 * 1024 * 1024; //10MB size limit
        if (file && file.type === 'application/pdf') {
            if (file.size > maxSize) {
                fileInput.value = ''; 
                file_name.textContent = 'Файл превышает 10 МБ';
                file_name.style.color = '#e74d3cb0';
                fileValid = false; 
            }
            else{
                file_name.textContent = file.name;
                file_name.style.color = '#000000';
                fileValid = true;
            }
        } else {
            fileInput.value = ''; 
            file_name.textContent = 'Только файлы .pdf';
            file_name.style.color = '#e74d3cb0'; 
            fileValid = false; 
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const textDelta = editor.getContents(); // Get the Delta content of the editor
        textInput.value = JSON.stringify(textDelta); // Convert the Delta to a JSON string and assign it to the input field

        if (validateForm(JSON.stringify(textDelta))){
            form.submit();
        }
        else{
            alert("Please fill out all the forms before submitting!");
        }
    });

    const button_cancel = document.getElementById('button_cancel');
    button_cancel.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default redirect or form submission
        console.log('Cancel button clicked, redirecting to home');
        window.location.href = '/'; // Redirect to home
    });

    function validateForm(textJSON) {
        const emptyDelta = { "ops": [{ "insert": "\n" }] };
        if (toggle.checked){
            return ((title.value != '') && fileValid);    
        }
        else{
            return ((title.value != '') && (textJSON != emptyDelta));
        }
    }
});