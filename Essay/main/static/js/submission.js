document.addEventListener('DOMContentLoaded', function () {
    const title = document.getElementById('title');
    title.value = subm_obj.title;

    const result = document.getElementById('result');
    result.value = subm_obj.result;
    const result_value = document.getElementById('result-value');
    result_value.innerText = subm_obj.result;

    const task = new Quill('#task', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true // Make the editor uneditable
    });
    const task_delta = JSON.parse(task_obj.text);
    task.setContents(task_delta);

    const feedback = new Quill('#feedback', {
        theme: 'snow',
        modules: {
            toolbar: false // Disable the toolbar
        },
        readOnly: true // Make the editor uneditable
    });
    const feedback_delta = JSON.parse(subm_obj.feedback);
    feedback.setContents(feedback_delta);

    //Essay Logic
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

    const button = document.getElementById('button_cancel');
    button_cancel.addEventListener('click', () => {
        window.location.href = '/';
    })
})