// Load navbar
fetch('html/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;

    // Attach click listener AFTER navbar is injected
    const registerLink = document.querySelector('a[href="#register-student"]');
    if (registerLink) {
      registerLink.addEventListener('click', function (e) {
        e.preventDefault();
        loadRegisterStudent();
      }, { once: true });
    }
    //// This will load the clubs info
    const viewClubsLink = document.querySelector('a[href="#view-clubs"]');
    if (viewClubsLink) {
      viewClubsLink.addEventListener('click', function (e) {
        e.preventDefault();
        loadViewClubs(); 
      }, { once: true });
    }
      // This will load the students info
    const studentsLink = document.getElementById("view-students-link");
    if (studentsLink) {
      studentsLink.addEventListener("click", function (e) {
        e.preventDefault();
        loadStudentView();
      }, { once: true });
    }
  });

// Load footer
fetch('html/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;

    // Set year AFTER footer is loaded
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.innerText = new Date().getFullYear();
    }
  });

// Load the register student form dynamically
function loadRegisterStudent() {
  fetch('html/register_student.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('main-content').innerHTML = data;
      loadClubs();

      // Attach submit listener AFTER form is injected
      const form = document.getElementById('registerForm');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();

          const selectedClubs = document.querySelectorAll('.club-checkbox:checked');
          if (selectedClubs.length === 0) {
            showAlert('Please select at least one club.', 'danger');
            return;
          }

          const formData = new FormData(form);
          selectedClubs.forEach(club => {
            formData.append('clubs[]', club.value);
          });

          fetch('api/register_student.php', {
            method: 'POST',
            body: formData
          })
            .then(res => res.json())
            .then(response => {
              showAlert(response.message, response.success ? 'success' : 'danger');
              if (response.success) {
                form.reset();
                updateTotalFee();
              }
            })
            .catch(() => {
              showAlert('Failed to register student. Try again.', 'danger');
            });
        });
      }
    })
    .catch(error => console.error('Failed to load register_student.html:', error));
}

// Fetch and render clubs from backend
function loadClubs() {
  fetch('api/get_clubs.php')
    .then(response => response.json())
    .then(clubs => {
      const container = document.getElementById('clubs-container');
      container.innerHTML = '';
      clubs.forEach(club => {
        const checkbox = document.createElement('div');
        checkbox.classList.add('form-check');
        checkbox.innerHTML = `
          <input class="form-check-input club-checkbox" type="checkbox" name="clubs[]" value="${club.id}" data-fee="${club.registration_fee}" id="club${club.id}">
          <label class="form-check-label" for="club${club.id}">${club.name} (KES ${club.registration_fee})</label>
        `;
        container.appendChild(checkbox);
      });

      // Update total fee on checkbox change
      document.querySelectorAll('.club-checkbox').forEach(box => {
        box.addEventListener('change', updateTotalFee);
      });
    })
    .catch(err => {
      showAlert('Failed to load clubs.', 'danger');
      console.error('Error fetching clubs:', err);
    });
}

// Calculate and display total registration fee
function updateTotalFee() {
  let total = 0;
  document.querySelectorAll('.club-checkbox:checked').forEach(cb => {
    total += parseInt(cb.dataset.fee);
  });
  const totalFeeSpan = document.getElementById('totalFee');
  if (totalFeeSpan) {
    totalFeeSpan.innerText = total;
  }
}

// Display alerts
function showAlert(message, type) {
  const alertBox = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  const alertPlaceholder = document.getElementById('alert-placeholder');
  if (alertPlaceholder) {
    alertPlaceholder.innerHTML = alertBox;
  }
}



function loadViewClubs() {
  fetch('html/view_clubs.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('main-content').innerHTML = data;
      fetchClubDetails();
    })
    .catch(err => {
      showAlert('Failed to load clubs view.', 'danger');
      console.error(err);
    });
}

function fetchClubDetails() {
  fetch('api/get_club_details.php')
    .then(res => res.json())
    .then(clubs => {
      const container = document.getElementById('clubs-list');
      container.innerHTML = '';

      clubs.forEach(club => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${club.name}</h5>
            <p class="card-text">
              <strong>Club Patron:</strong> ${club.patron_name}<br>
              <p><strong>Registration Fee:</strong> ${club.registration_fee}</p>
              <strong>Total Members:</strong> ${club.total_members}<br>
              <strong>Total Collected:</strong> KES ${club.total_registration}<br>
              <strong>Activities:</strong> ${club.activities || 'None'}
            </p>
            <button class="btn btn-outline-primary btn-sm" data-club-id="${club.id}">View More</button>
          </div>
        `;
        container.appendChild(card);
      });

      // Add click listeners to buttons
      container.querySelectorAll('button[data-club-id]').forEach(button => {
        button.addEventListener('click', e => {
          const clubId = e.target.getAttribute('data-club-id');
          viewClubDetails(clubId);
        });
      });
    })
    .catch(err => {
      showAlert('Could not fetch clubs.', 'danger');
      console.error(err);
    });
}

function viewClubDetails(clubId) {
  fetch(`api/get_single_club.php?id=${clubId}`)
    .then(res => res.json())
    .then(club => {
      window.currentClubId = clubId; // For use in other functions
      window.clubActivities = JSON.parse(club.activities || '[]');

      const container = document.getElementById('main-content');
      container.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
            <h4>${club.name} - Detailed View</h4>
            <button class="btn btn-danger btn-sm" onclick="deleteClub(${club.id})">Delete Club</button>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label><strong>Club Patron:</strong></label>
              <input type="text" class="form-control" id="editPatronName" value="${club.patron_name}">
            </div>
            <div class="mb-3">
              <label><strong>Registration Fee (KES):</strong></label>
              <input type="number" class="form-control" id="editRegFee" value="${club.registration_fee}">
            </div>
            <p><strong>Total Members:</strong> ${club.total_members}</p>
            <p><strong>Finance (KES):</strong> ${club.total_income}</p>
            <div class="mb-3">
              <label><strong>Activities:</strong></label>
              <table class="table table-bordered">
                <thead class="table-secondary">
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Amount (KES)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="activitiesTableBody">
                  ${
                    window.clubActivities.map((act, index) => `
                      <tr data-index="${index}">
                        <td><input type="text" class="form-control" value="${act.name}" onchange="updateActivityField(${index}, 'name', this.value)"></td>
                        <td><input type="date" class="form-control" value="${act.date}" onchange="updateActivityField(${index}, 'date', this.value)"></td>
                        <td><input type="number" class="form-control" value="${act.amount}" onchange="updateActivityField(${index}, 'amount', this.value)"></td>
                        <td><button class="btn btn-sm btn-danger" onclick="deleteActivity(${index})">🗑️</button></td>
                      </tr>
                    `).join('')
                  }
                </tbody>
              </table>
            </div>

            <button class="btn btn-success mb-3" onclick="updateClubDetails(${club.id})">Save Changes</button>
            <button class="btn btn-warning mb-3 ms-2" data-bs-toggle="modal" data-bs-target="#addActivityModal">➕ Add New Activity</button>
            <hr>
            <h5>Add Member</h5>
            <input type="text" id="studentSearchInput" placeholder="Search by name or admission" class="form-control mb-2">
            <ul id="studentSearchResults" class="list-group mb-2"></ul>
            <button class="btn btn-primary" id="addSelectedStudentBtn" disabled>Add to Club</button>
            <br>
            <button class="btn btn-outline-dark mt-3" id="backToList">← Back to All Clubs</button>
          </div>
        </div>

        <!-- Modal injected dynamically -->
        <div class="modal fade" id="addActivityModal" tabindex="-1" aria-labelledby="addActivityModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="addActivityModalLabel">Add New Activity</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <input type="text" id="activityName" class="form-control mb-2" placeholder="Activity Name">
                <input type="date" id="activityDate" class="form-control mb-2">
                <input type="number" id="activityAmount" class="form-control mb-2" placeholder="Amount Collected (KES)">
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-success" onclick="submitNewActivity()">Add Activity</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event Listeners
      document.getElementById('backToList').addEventListener('click', loadViewClubs);
      document.getElementById('studentSearchInput').addEventListener('input', (e) => {
        searchStudent(e.target.value, club.id);
      });
      document.getElementById('addSelectedStudentBtn').addEventListener('click', () => {
        addSelectedStudentToClub(club.id);
      });
    })
    .catch(err => {
      showAlert('Failed to fetch club details.', 'danger');
      console.error(err);
    });
}


function updateClubDetails(clubId) {
  const patronName = document.getElementById('editPatronName').value.trim();
  const regFee = parseFloat(document.getElementById('editRegFee').value);

  if (!patronName || isNaN(regFee)) {
    showAlert('Please fill all required fields correctly.', 'warning');
    return;
  }

  const updatedData = {
    id: clubId,
    patron_name: patronName,
    registration_fee: regFee,
    activities: JSON.stringify(window.clubActivities)
  };

  fetch('api/update_club.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        showAlert('Club updated successfully.', 'success');
        // Refresh view
        viewClubDetails(clubId); 
      } else {
        showAlert(response.message || 'Update failed.', 'danger');
      }
    })
    .catch(err => {
      showAlert('Error updating club.', 'danger');
      console.error(err);
    });
}


function updateActivityField(index, field, value) {
  if (window.clubActivities[index]) {
    window.clubActivities[index][field] = value;
  }
}

function deleteActivity(index) {
  window.clubActivities.splice(index, 1);
  viewClubDetails(window.currentClubId);
}

function submitNewActivity() {
  const name = document.getElementById('activityName').value.trim();
  const date = document.getElementById('activityDate').value;
  const amount = parseFloat(document.getElementById('activityAmount').value);

  if (!name || !date || isNaN(amount)) {
    alert("Please fill in all activity fields.");
    return;
  }

  window.clubActivities.push({ name, date, amount });
  document.querySelector('#addActivityModal .btn-close').click();
  viewClubDetails(window.currentClubId);
}




let selectedStudentId = null;
function searchStudent(query) {
  if (!query) return;

  fetch(`api/search_students.php?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(students => {
      const results = document.getElementById('studentSearchResults');
      results.innerHTML = '';
      students.forEach(student => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.textContent = `${student.name} (${student.admission_no})`;
        li.onclick = () => {
          selectedStudentId = student.id;
          document.getElementById('studentSearchInput').value = student.name;
          document.getElementById('addSelectedStudentBtn').disabled = false;
          results.innerHTML = '';
        };
        results.appendChild(li);
      });
    });
}

function addSelectedStudentToClub(clubId) {
  if (!selectedStudentId) return alert('Please select a student to add.');

  fetch('api/add_membership.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      student_id: selectedStudentId,
      club_id: clubId,
      year: new Date().getFullYear(),
      role: 'Regular'
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showAlert('Student added to club successfully.', 'success');
        // Refresh club view
        viewClubDetails(clubId); 
      } else {
        showAlert(data.message || 'Failed to add student.', 'danger');
      }
    })
    .catch(err => {
      console.error('Error adding student:', err);
      showAlert('Error adding student to club.', 'danger');
    });
}

function updateClubDetails(clubId) {
  const patronName = document.getElementById('editPatronName').value.trim();
  const regFee = document.getElementById('editRegFee').value.trim();
  const activities = document.getElementById('editActivities').value.trim();

  fetch('api/update_club.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ club_id: clubId, patron_name: patronName, registration_fee: regFee, activities })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showAlert('Club updated successfully.', 'success');
        // Refresh view
        viewClubDetails(clubId); 
      } else {
        showAlert('Failed to update club.', 'danger');
      }
    })
    .catch(err => {
      showAlert('Error updating club.', 'danger');
      console.error(err);
    });
}


function deleteClub(clubId) {
  if (!confirm('Are you sure you want to delete this club?')) return;

  fetch(`api/delete_club.php?id=${clubId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showAlert('Club deleted successfully.', 'success');
        loadViewClubs();
      } else {
        showAlert('Failed to delete club.', 'danger');
      }
    })
    .catch(err => {
      showAlert('Error deleting club.', 'danger');
      console.error(err);
    });
}



function loadStudentView() {
  fetch('html/view_students.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
      setTimeout(() => fetchStudents(1), 50);
    });
}

function renderPagination(totalPages, currentPage, search) {
  const container = document.getElementById('paginationControls');
  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-dark' : 'btn-outline-dark'} m-1`;
    btn.textContent = i;
    btn.onclick = () => fetchStudents(i, search);
    container.appendChild(btn);
  }
}

function fetchStudents(page = 1, search = '') {
  fetch(`api/get_students.php?page=${page}&search=${encodeURIComponent(search)}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('studentsTableBody');
      tbody.innerHTML = '';

      if (data.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No students found.</td></tr>';
        return;
      }

      data.students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${(page - 1) * 10 + index + 1}</td>
          <td>${student.admission_no}</td>
          <td>${student.name}</td>
          <td>${student.class}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="getStudentToUpdate(${student.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      // ✅ Moved inside here
      renderPagination(data.total_pages, page, search);
    })
    .catch(error => {
      showAlert('Error fetching students:', "danger");
    });
}


function getStudentToUpdate(id) {
  fetch(`api/get_single_student.php?id=${id}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("updateStudentId").value = data.id;
      document.getElementById("updateAdmissionNo").value = data.admission_no;
      document.getElementById("updateName").value = data.name;
      document.getElementById("updateClass").value = data.class;
      const modalEl = document.getElementById("updateStudentModal");
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });
}


// Handle form submission to update student
function updateStudent() {
  const id = document.getElementById('updateStudentId').value;
  const admissionNo = document.getElementById('updateAdmissionNo').value;
  const name = document.getElementById('updateName').value;
  const studentClass = document.getElementById('updateClass').value;

  fetch(`/api/update_student.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
      admission_no: admissionNo,
      name: name,
      class: studentClass,
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Student updated successfully!');
        fetchStudents(1);
        bootstrap.Modal.getInstance(document.getElementById("updateStudentModal")).hide();
      } else {
        showAlert("Failed to update student!", "danger");
      }
    })
    .catch(error => {
      console.error('Error updating student:', error);
      showAlert("Error updating student!", "danger");
    });
}


// Search functionality
function searchStudents() {
  const searchQuery = document.getElementById("searchInput").value.trim();
  fetchStudents(1, searchQuery);
}

function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function deleteStudent(id) {
  if (confirm("Are you sure you want to delete this student?")) {
    fetch(`api/delete_student.php?id=${id}`, { method: 'DELETE' })
      .then(res => res.text())
      .then(msg => {
        showAlert('Student deleted successfully', 'success');
        fetchStudents(1);
      });
  }
}

function submitNewActivity() {
  const name = document.getElementById('activityName').value.trim();
  const date = document.getElementById('activityDate').value;
  const amount = parseInt(document.getElementById('activityAmount').value);
  const clubId = window.currentClubId;

  if (!name || !date || isNaN(amount)) {
    showAlert('Please fill all activity fields.', 'warning');
    return;
  }

  fetch('api/add_activity.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      club_id: clubId,
      activity_name: name,
      date_of_activity: date,
      amount_collected: amount
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showAlert('Activity added successfully.', 'success');
        bootstrap.Modal.getInstance(document.getElementById('addActivityModal')).hide();
        viewClubDetails(clubId); // Refresh view
      } else {
        showAlert('Error adding activity: ' + (data.error || ''), 'danger');
      }
    })
    .catch(err => {
      console.error(err);
      showAlert('Network error. Try again.', 'danger');
    });
}
