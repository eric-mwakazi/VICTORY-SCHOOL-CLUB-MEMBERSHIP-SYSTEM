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
      container.innerHTML = ''; // Clear previous content if any
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

