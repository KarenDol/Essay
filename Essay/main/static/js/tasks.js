document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mainForm');
    
    const iron = document.getElementById('iron');
    const bronze = document.getElementById('bronze');
    const silver = document.getElementById('silver');
    const gold = document.getElementById('gold');
    const plat = document.getElementById('plat');

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

    let rank = 'iron'; // Iron by default
    updateTasks('iron'); 

    const ranks = [iron, bronze, silver, gold, plat];

    ranks.forEach((element) => {
        element.addEventListener('click', () => {
            // Remove 'logo-chosen' from all ranks, set to 'logo'
            ranks.forEach((el) => {
                el.classList.remove('logo-chosen');
                el.classList.add('logo');
            }); 

            // Add 'logo-chosen' to the clicked one
            element.classList.add('logo-chosen');
            element.classList.remove('logo');

            // Update the rank
            rank = element.id;
            updateTasks(rank);
            console.log(`Rank changed to: ${rank}`);
        });
    });

    // Function to update task editors based on selected rank
    function updateTasks(rank) {
        const filteredTasks = tasks.filter(task => task.rank === rank);
        console.log(filteredTasks);
        // Update each editor div with task data
        // Ensure there are exactly 5 tasks
        if (filteredTasks.length === 5) {
            filteredTasks.forEach((task, index) => {
                const editor = editors[index];
                const text_delta = JSON.parse(task.text);
                editor.setContents(text_delta);
            });
        } else {
            console.error('Expected exactly 5 tasks, but got', filteredTasks.length);
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const rankInput = document.getElementById('rank-input');
        rankInput.value = rank;

        for (let i = 1; i <= 5; i++) {
            console.log(`task${i}`);
            const textEditor = editors[i-1]; // Get the Quill editor element
            const textInput = document.getElementById(`task${i}-input`); // Get the corresponding input element
        
            if (textEditor && textInput) {
                const textDelta = textEditor.getContents(); // Get the Delta content of the editor
                textInput.value = JSON.stringify(textDelta); // Convert the Delta to a JSON string and assign it to the input field
            }
        }

        form.submit();
    });

    document.getElementById("button_cancel").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default action if necessary
        window.location.href = "/"; // Redirect to 'home'
    });    
});