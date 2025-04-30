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
      const container = document.getElementById('main-content');
      container.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white">
            <h4>${club.name} - Detailed View</h4>
          </div>
          <div class="card-body">
            <p><strong>Total Members:</strong> ${club.total_members}</p>
            <p><strong>Finance (KES):</strong> ${club.total_registration}</p>
            <p><strong>Activities:</strong><br>${club.activities || 'None'}</p>
            <button class="btn btn-outline-dark" id="backToList">← Back to All Clubs</button>
          </div>
        </div>
      `;

      document.getElementById('backToList').addEventListener('click', loadViewClubs);
    })
    .catch(err => {
      showAlert('Failed to fetch club details.', 'danger');
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

