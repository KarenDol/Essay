document.addEventListener('DOMContentLoaded', function () {
    const attemptsSection = document.getElementById('attempts-section');
    const submitSection = document.getElementById('submit-section');
    const table = document.getElementById('submissions-table');
    const submitH3 = document.getElementById('submit-h3');

    if (submissions.length == 0){
        attemptsSection.style.display = 'none';
    }
    // Loop through each submission and create a row
    submissions.forEach((submission, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            ${
                submission.status === 'che'
                    ? `<td><a href="/submission/${submission.id}">${submission.title}</a></td>`
                    : `<td>${submission.title}</td>`
            }
            <td>${submission.result || '--'}/10</td>
        `;

        
        // Append the row to the table
        table.appendChild(row);
    });

    if (act_subm && act_task) {
        const taskDesc = new Quill('#task-desc', {
            theme: 'snow',
            modules: {
                toolbar: false // Disable the toolbar
            },
            readOnly: true // Make the editor uneditable
        });
        //JSON -> Delta
        const task_delta = JSON.parse(act_task.text);
        taskDesc.setContents(task_delta);

        const deadline = new Date(act_subm.deadline);
        const formattedDeadline = deadline.toISOString().slice(0, 16).replace('T', ' ');
        submitH3.innerText = `Submit New Essay by ${formattedDeadline}`;

        const attemptButton = document.getElementById('attempt-button');
        attemptButton.addEventListener('click', () => {
            window.location.href = `/submit/${act_subm.id}`;
        })
    }
    else{
        submitSection.style.display = 'none';
    }

})