document.addEventListener('DOMContentLoaded', function () {
    const table_header = document.getElementById('table_header');
    const table = document.getElementById('table');
    const btn_subm = document.getElementById('btn_subm');
    const div_sumb = document.getElementById('div_subm');
    const btn_task = document.getElementById('btn_task');
    const div_task = document.getElementById('div_task');
    const btn_cancel = document.getElementById('btn_cancel');
    const btn_save = document.getElementById('btn_save');
    //Tasks
    const task1 = new Quill('#task1', {
        theme: 'snow'
    });
    const task2 = new Quill('#task2', {
        theme: 'snow'
    });
    const task3 = new Quill('#task3', {
        theme: 'snow'
    });
    const task4 = new Quill('#task4', {
        theme: 'snow'
    });
    const task5 = new Quill('#task5', {
        theme: 'snow'
    });
    const editors = [task1, task2, task3, task4, task5];

    //ranks
    const iron = document.getElementById('iron');
    const bronze = document.getElementById('bronze');
    const silver = document.getElementById('silver');

    const ranks = [iron, bronze, silver];

    //By default mode='subm' and rank='iron' are chosen
    let mode = 'subm';
    let rank = 'iron';
    iron.style.borderColor = '#59007A';

    //Evaluate the mode
    evaluate_mode();

    //Event listeners
    ranks.forEach((element) => {
        element.addEventListener('click', () => {
            // Mark all logos as unchosen
            ranks.forEach((el) => {
                el.style.borderColor = '#E5E5E5';
            }); 

            // Mark the chosen logo
            element.style.borderColor = '#59007A';

            // Update the rank
            rank = element.id;
            evaluate_mode();
        });
    });

    btn_subm.addEventListener('click', () => {
        //if mode='subm' no actions are required
        if (mode === 'task'){
            mode = 'subm';
            evaluate_mode();
        }
    })

    btn_task.addEventListener('click', () => {
        //if mode='task' no actions are required
        if (mode === 'subm'){
            mode = 'task';
            evaluate_mode();
        }
    })

    //Load the original tasks
    btn_cancel.addEventListener('click', () => {updateTasks()})

    btn_save.addEventListener('click', async () => {
        try {
            const data = {
                rank: rank,
                task1: JSON.stringify(task1.getContents()),
                task2: JSON.stringify(task2.getContents()),
                task3: JSON.stringify(task3.getContents()),
                task4: JSON.stringify(task4.getContents()),
                task5: JSON.stringify(task5.getContents())
            };

            const response = await fetch('/tasks/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
            });


            if (response.status === 200) {
                alert('✅ Жаңа тапсырламалар сақталынды!');
                //Update the tasks dictionary
                startId = rank_id[rank];
                editors.forEach((editor, i) => {
                    const taskId = startId + i;
                    const task = tasks.find(t => t.id === taskId);
            
                    if (task) {
                        task.text = JSON.stringify(editor.getContents());
                    }
                });
            } else {
                alert('❌ Қате: ' + result.message);
            }
          } catch (err) {
            alert('❌ Network error.');
        }
    });

    function updateSubmissions () {
        //Button styles
        table.innerHTML = '';

        submissions
            .filter(submission => submission.task__rank === rank)
            .forEach((submission, i) => {
                const date = new Date(submission.deadline);
                const formattedDate = date.toISOString().split('T')[0];

                const row = document.createElement('tr');
                const student_name = `${submission.student__first_name} ${submission.student__last_name}`;
                row.innerHTML = `
                <td>${i + 1}</td>
                <td>${formattedDate}</td>
                <td><a href="/submission/${submission.id}">${student_name}: ${submission.title}</a></td>
                <td>${submission.result || '--'}/10</td>
                `;
                table.appendChild(row);
            });
    }

    // Function to update task editors based on selected rank
    function updateTasks() {
        const filteredTasks = tasks.filter(task => task.rank === rank);

        filteredTasks.forEach((task, index) => {
            const editor = editors[index];
            const text_delta = JSON.parse(task.text);
            editor.setContents(text_delta);
        });
    }

    function evaluate_mode() {
        if (mode === 'subm'){
            table_header.innerText = 'Оқушылар тапсырған эсселер';

            div_task.style.display = 'none';
            div_subm.style.display = 'block';
            
            btn_subm.classList.remove('secondary');
            btn_subm.classList.add('primary');
            btn_task.classList.remove('primary');
            btn_task.classList.add('secondary');

            updateSubmissions();
        } else {
            table_header.innerText = 'Лигаға арналған тапсырмалар';

            div_task.style.display = 'block';
            div_subm.style.display = 'none';

            btn_subm.classList.remove('primary');
            btn_subm.classList.add('secondary');
            btn_task.classList.remove('secondary');
            btn_task.classList.add('primary');

            updateTasks();
        }
    }
})