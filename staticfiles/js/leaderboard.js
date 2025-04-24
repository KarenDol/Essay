document.addEventListener('DOMContentLoaded', function() {
    // Populate student info
    document.getElementById('student-name').textContent = `${student.last_name} ${student.first_name}`;
    document.getElementById('student-balance').textContent = student.rr;
    document.getElementById('student-rank').textContent = `Current Rank: #${rank}`;
    
    // Set student avatar or fallback to initials
    const studentAvatar = document.getElementById('student-avatar').querySelector('img');
    const studentInitials = document.getElementById('student-initials');
    
    studentAvatar.src = student.avatar;
    studentAvatar.onerror = function() {
      this.style.display = 'none';
      studentInitials.style.display = 'flex';
    };
    
    // Generate initials from name
    const initials = `${student.first_name[0]}${student.last_name[0]}`
    studentInitials.textContent = initials;
    
    // Populate leaderboard
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    students.forEach((student, index) => {
      const row = document.createElement('tr');
      row.className = 'leaderboard-row';
      
      // Highlight current user
      if (parseInt(rank) === (index+1)) {
        row.classList.add('current-user');
      }
      
      // Rank column with trophies for top 3
      const rankCell = document.createElement('td');
      if (index < 3) {
        const trophyIcon = document.createElement('i');
        trophyIcon.className = 'fas fa-trophy';
        
        if (index === 0) {
          trophyIcon.classList.add('trophy-gold');
        } else if (index === 1) {
          trophyIcon.classList.add('trophy-silver');
        } else {
          trophyIcon.classList.add('trophy-bronze');
        }
        
        rankCell.appendChild(trophyIcon);
      } else {
        rankCell.textContent = `#${index + 1}`;
      }
      
      // Student column with avatar and name
      const studentCell = document.createElement('td');
      const studentDiv = document.createElement('div');
      studentDiv.className = 'student-cell';
      
      // Avatar
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      
      const avatarImg = document.createElement('img');
      avatarImg.src = "https://via.placeholder.com/32";
      avatarImg.alt = student.first_name;
      
      const avatarFallback = document.createElement('div');
      avatarFallback.className = 'avatar-fallback';
      avatarFallback.textContent = student.first_name[0] + student.last_name[0];
      
      avatarImg.onerror = function() {
        this.style.display = 'none';
        avatarFallback.style.display = 'flex';
      };
      
      avatar.appendChild(avatarImg);
      avatar.appendChild(avatarFallback);
      
      // Name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${student.last_name} ${student.first_name}`;
      if (parseInt(rank) === (index+1)) {
        nameSpan.style.fontWeight = '700';
        console.log("WORKER!", index+1);
      }
      
      
      studentDiv.appendChild(avatar);
      studentDiv.appendChild(nameSpan);
      studentCell.appendChild(studentDiv);
      
      // Balance column
      const balanceCell = document.createElement('td');
      balanceCell.textContent = student.rr;
      
      // Add cells to row
      row.appendChild(rankCell);
      row.appendChild(studentCell);
      row.appendChild(balanceCell);
      
      // Add row to table
      leaderboardBody.appendChild(row);
    });
  });