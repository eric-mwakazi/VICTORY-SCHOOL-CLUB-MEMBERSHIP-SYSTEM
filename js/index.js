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
    const studentsLink = document.getElementById('a[href="#view-students]"');
    if (studentsLink) {
      studentsLink.addEventListener("click", function (e) {
        e.preventDefault();
        loadStudentView();
      }, { once: true });
    }

    // Ensure dropdown functionality is triggered for the Reports link
    const reportsLink = document.getElementById('view-reports');
    if (reportsLink) {
        reportsLink.addEventListener("click", function (e) {
            e.preventDefault();
            // Toggle the dropdown menu
            const dropdownMenu = document.querySelector('.dropdown-menu');
            dropdownMenu.classList.toggle('show')}, { once: true });
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
            <button class="btn btn-outline-primary btn-sm" onclick="viewClubDetails(${club.id})">View More</button>
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
  fetch('html/club_details.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // Now fetch the club data
      return fetch(`api/get_single_club.php?id=${clubId}`);
    })
    .then(res => res.json())
    .then(club => {
      window.currentClubId = clubId;
      window.clubActivities = JSON.parse(club.activities || '[]');

      // Populate HTML fields
      document.getElementById('club-details-card').setAttribute('data-club-id', club.id);
      document.getElementById('club-name-title').textContent = `${club.name} - Detailed View`;
      document.getElementById('editPatronName').value = club.patron_name;
      document.getElementById('editRegFee').value = club.registration_fee;
      document.getElementById('total-members').textContent = club.total_members;
      document.getElementById('total-income').textContent = club.total_income;

      renderActivitiesTable();


      // Attach all event listeners now that DOM is ready
      document.getElementById('saveChangesBtn').onclick = () => updateClubDetails(clubId);
      document.getElementById('delete-club-btn').onclick = () => deleteClub(clubId);
      document.getElementById('backToList').onclick = loadViewClubs;

      document.getElementById('studentSearchInput').addEventListener('input', (e) => {
        searchStudent(e.target.value, club.id);
      });

      document.getElementById('addSelectedStudentBtn').addEventListener('click', () => {
        addSelectedStudentToClub(club.id);
      });
      // ✅ View Members button handler
      document.getElementById('viewMemberDetails').onclick = () => viewClubMembers(club.id);
      // ✅ View Finances button handler
      document.getElementById('viewFinaceDetails').onclick = () => viewClubfinaces(club.id);

    })
    .catch(err => {
      showAlert('Failed to load club details.', 'danger');
      console.error(err);
    });
}

function viewClubMembers(clubId) {
  fetch('html/track_members.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
      window.currentClubId = clubId;
      loadClubMembers(clubId);
      document.getElementById('backToList').onclick = loadViewClubs;
    })
    .catch(err => {
      showAlert('Failed to load club members view.', 'danger');
      console.error(err);
    });
}

function renderActivitiesTable() {
  const tbody = document.getElementById('activitiesTableBody');
  tbody.innerHTML = window.clubActivities.map((act, index) => `
    <tr data-index="${index}">
      <td><input type="text" class="form-control" value="${act.name}" onchange="updateActivityField(${index}, 'name', this.value)"></td>
      <td><input type="date" class="form-control" value="${act.date}" onchange="updateActivityField(${index}, 'date', this.value)"></td>
      <td><input type="number" class="form-control" value="${act.amount}" onchange="updateActivityField(${index}, 'amount', this.value)"></td>
    </tr>
  `).join('');
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
  // Remove the activity from the list
  window.clubActivities.splice(index, 1);

  // Just re-render the table without fetching data again
  renderActivitiesTable();
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
        viewClubDetails(clubId);
      } else {
        showAlert('Error adding activity: ' + (data.error || ''), 'danger');
      }
    })
    .catch(err => {
      console.error(err);
      showAlert('Network error. Try again.', 'danger');
    });
}


function removeMember(memberId) {
  fetch('api/remove_member.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: memberId })
  }).then(res => res.json())
    .then(resp => {
      if (resp.success) loadClubMembers(window.currentClubId);
    });
}

function paginateTable(data, tableBodyId, paginationDivId, pageSize = 10) {
  let currentPage = 1;
  const tableBody = document.getElementById(tableBodyId);
  const pagination = document.getElementById(paginationDivId);

  function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    tableBody.innerHTML = data.slice(start, end).map((member, i) => `
      <tr>
        <td>${member.name}</td>
        <td>${member.admission_no}</td>
        <td>${member.role}</td>
        <td>${member.status}</td>
        <td>${member.date_joined}</td>
        ${member.status === 'LEFT' ? `<td>${member.date_left}</td>` : ''}
        ${member.status === 'ACTIVE' ? `<td><button onclick="removeMember(${member.id})" class="btn btn-sm btn-danger">Remove</button></td>` : ''}
      </tr>
    `).join('');

    renderPaginationButtons(data.length, pagination, renderPage);
  }

  renderPage(1);
}

function loadClubMembers(clubId) {
  fetch(`api/get_members.php?club_id=${clubId}`)
    .then(res => res.json())
    .then(data => {
      window.currentMembers = data;
      paginateTable(data.active, 'activeMembersTableBody', 'activePagination', true);
      paginateTable(data.left, 'pastMembersTableBody', 'pastPagination', false);
    })
    .catch(err => {
      showAlert("Failed to load members", "danger");
      console.error(err);
    });
}

function paginateTable(data, tableBodyId, paginationDivId, canRemove = false, pageSize = 10) {
  let currentPage = 1;
  const tableBody = document.getElementById(tableBodyId);
  const pagination = document.getElementById(paginationDivId);

  function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const rows = data.slice(start, end).map(member => `
      <tr>
        <td>${member.name}</td>
        <td>${member.admission_no}</td>
        <td>${member.role}</td>
        <td>${member.status}</td>
        <td>${member.date_joined}</td>
        ${member.status === 'LEFT' ? `
          <td>${member.date_left}</td>
          <td><button onclick="reactivateMember(${member.id})" class="btn btn-sm btn-success">Add Back</button></td>
        ` : 
        (canRemove ? `<td><button onclick="removeMember(${member.id})" class="btn btn-sm btn-danger">Remove</button></td>` : '')
        }
      </tr>
    `).join('');
    tableBody.innerHTML = rows;
    renderPaginationButtons(data.length, page, pagination, renderPage);
  }

  renderPage(1);
}

function renderPaginationButtons(totalItems, currentPage, container, onPageClick, pageSize = 10) {
  const pageCount = Math.ceil(totalItems / pageSize);
  container.innerHTML = '';

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1`;
    btn.onclick = () => onPageClick(i);
    container.appendChild(btn);
  }
}

function removeMember(memberId) {
  if (!confirm("Are you sure you want to remove this member?")) return;

  fetch('api/remove_member.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ membership_id: memberId })
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.success) {
        showAlert("Member removed", "success");
        loadClubMembers(window.currentClubId);
      } else {
        showAlert(resp.message || "Failed to remove", "danger");
      }
    });
}

function reactivateMember(memberId) {
  if (!confirm("Add this member back to the club?")) return;

  fetch('api/reactivate_member.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ membership_id: memberId })
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.success) {
        showAlert("Member reactivated", "success");
        loadClubMembers(window.currentClubId);
      } else {
        showAlert(resp.message || "Failed to reactivate", "danger");
      }
    })
    .catch(err => {
      console.error(err);
      showAlert("Something went wrong", "danger");
    });
}


/**
 * 
 * Manage club finances generated from club activities, including registration fees and
expenses.
 */

function loadClubfinaces(clubId) {
  fetch(`api/get_club_finances.php?club_id=${clubId}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        showAlert("Finance details not found", "danger");
        return;
      }

      const f = data.finance;
      document.getElementById("clubFinanceName").innerText = f.club_name;

      document.getElementById("totalRegistration").innerText = f.total_registration;
      document.getElementById("totalActivityIncome").innerText = f.total_activity_income;
      document.getElementById("ongoingActivitiesFund").innerText = f.ongoing_activities_fund;
      document.getElementById("annualPartyFund").innerText = f.annual_party_fund;
      document.getElementById("savings").innerText = f.savings;
      document.getElementById("schoolContribution").innerText = f.school_contribution;
      document.getElementById("totalAmount").innerText = f.total_amount;
      document.getElementById("lastUpdated").innerText = f.last_updated;

      // Show section or modal
      document.getElementById("financeDetailsSection").classList.remove("d-none");
    })
    .catch(err => {
      console.error(err);
      showAlert("Failed to load finance data", "danger");
    });
}

function viewClubfinaces(clubId) {
  fetch('html/track_finances.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
      window.currentClubId = clubId;
      loadClubfinaces(clubId);
      document.getElementById('backToList').onclick = loadViewClubs;
    })
    .catch(err => {
      showAlert('Failed to load club members view.', 'danger');
      console.error(err);
    });
}