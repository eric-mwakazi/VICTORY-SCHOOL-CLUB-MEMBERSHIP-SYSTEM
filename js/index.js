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
    // Attach listener AFTER navbar is injected
    const viewClubsLink = document.querySelector('a[href="#view-clubs"]');
    if (viewClubsLink) {
      viewClubsLink.addEventListener('click', function (e) {
        e.preventDefault();
        loadViewClubs(); // This will load the clubs info
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
      fetchClubDetails(); // Load club data
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
          viewClubDetails(clubId); // You’ll define this next
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
