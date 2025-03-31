document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('table');

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="/api/serve_static/ranks/${student.rank}.png"> ${student.rr} </td>
            <td><img src="/api/serve_static/avatars/${student.picture}" class="avatar"> ${student.last_name} ${student.first_name}</td>
        `;
        
        // Append the row to the table
        table.appendChild(row);
    });
})