document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('table');

    // Loop through each submission and create a row
    submissions.forEach((submission, index) => {
        // Extract date and format it as YYYY-MM-DD
        const date = new Date(submission.deadline);
        const formattedDate = date.toISOString().split('T')[0];  // This gives 'YYYY-MM-DD'

        // Create a new row for each submission
        const row = document.createElement('tr');

        // Create columns for each submission
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formattedDate}</td>
            <td><a href="/submission/${submission.id}">${submission.title}</a></td>
            <td>${submission.result || '--'}/10</td>
        `;

        // Append the new row to the table
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
    }
    else{
        submitSection.style.display = 'none';
    }
})