document.addEventListener('DOMContentLoaded', function () {
    const title = document.getElementById('title');
    title.value = subm_obj.title;

    const task = new Quill('#task', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true // Make the editor uneditable
    });

    //JSON -> Delta
    const task_delta = JSON.parse(task_obj.text);
    task.setContents(task_delta);

    if (subm_obj.type === 'text'){
        const essay = new Quill('#essay', {
            theme: 'snow',
            modules: {
                toolbar: false // Disable the toolbar
            },
            readOnly: true // Make the editor uneditable
        });

        //JSON -> Delta
        const essay_delta = JSON.parse(subm_obj.text);
        essay.setContents(essay_delta);      
        
        const fileWrap = document.getElementById('file-wrap');
        fileWrap.style.display = 'none';
    } else {
        const fileFrame = document.getElementById('file-frame');
        fileFrame.src = `/api/serve_static/essays/submission_${subm_obj.id}.pdf`;
    }

    const form = document.getElementById('mainForm');

    const feedback = new Quill('#feedback', {
        theme: 'snow'
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const feedbackInput = document.getElementById('feedback-input');
        const textDelta = feedback.getContents(); // Get the Delta content of the editor
        feedbackInput.value = JSON.stringify(textDelta); // Convert the Delta to a JSON string and assign it to the input field

        const emptyDelta = { "ops": [{ "insert": "\n" }] };
        if (JSON.stringify(textDelta) !== JSON.stringify(emptyDelta)) {      
            form.submit();
        }
        else{
            alert("Please fill out all the forms before submitting!");
        }
    });
})