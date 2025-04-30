// Load the financial reports page dynamically
function loadFinanceReports() {
    fetch('html/track_finances_report.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('main-content').innerHTML = data;
        loadClubsForReport();
  
        // Attach the event to the View Report button after the page is loaded
        const clubSelector = document.getElementById('clubSelector');
        if (clubSelector) {
          clubSelector.addEventListener('change', function() {
            const clubId = this.value;
            if (clubId) {
              generateFinancialReport(clubId);
            }
          });
        }
      })
      .catch(error => console.error('Failed to load track_finances.html:', error));
  }
  
  function loadEventsReports() {
    fetch('html/track_events_report.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('main-content').innerHTML = data;
        loadClubsForReport();
  
        // Attach the event to the View Report button after the page is loaded
        const clubSelector = document.getElementById('clubSelector');
        if (clubSelector) {
          clubSelector.addEventListener('change', function() {
            const clubId = this.value;
            if (clubId) {
              generateEventReport(clubId);
            }
          });
        }
      })
      .catch(error => console.error('Failed to load track_finances.html:', error));
  }
  // Load the clubs dynamically for selection
  function loadClubsForReport() {
    fetch('/api/get_clubs.php')
      .then(response => response.json())
      .then(clubs => {
        const clubSelector = document.getElementById('clubSelector');
        clubs.forEach(club => {
          const option = document.createElement('option');
          option.value = club.id;
          option.textContent = club.name;
          clubSelector.appendChild(option);
        });
      })
      .catch(error => console.error('Failed to load clubs:', error));
  }
  
  // Generate the financial report for the selected club
  function generateFinancialReport(clubId) {
    fetch(`/api/get_club_report.php?club_id=${clubId}`)
      .then(response => response.json())
      .then(data => {
        const clubName = data.club_name;
        document.getElementById('clubName').textContent = `Club: ${clubName}`;
  
        // Fill the finance table
        const f = data.finances;
        const total = 
            Number(f.total_registration) +
            Number(f.total_activity_income) +
            Number(f.ongoing_activities_fund) +
            Number(f.annual_party_fund) +
            Number(f.savings) +
            Number(f.school_contribution);

  
        document.getElementById('financeTable').innerHTML = `
          <tr><td>Total Registration</td><td>${f.total_registration}</td></tr>
          <tr><td>Total Activity Income</td><td>${f.total_activity_income}</td></tr>
          <tr><td>Ongoing Activities Fund</td><td>${f.ongoing_activities_fund}</td></tr>
          <tr><td>Annual Party Fund</td><td>${f.annual_party_fund}</td></tr>
          <tr><td>Savings</td><td>${f.savings}</td></tr>
          <tr><td>School Contribution</td><td>${f.school_contribution}</td></tr>
          <tr><th>Total</th><th>${total}</th></tr>
        `;
  
        // Fill the activity table
        document.getElementById('activityTable').innerHTML = data.activities.map(a => `
          <tr><td>${a.activity_name}</td><td>${a.date_of_activity}</td><td>${a.amount_collected}</td></tr>
        `).join('');
  
        // Render the chart
        const ctx = document.getElementById('financeChart').getContext('2d');

        // Safely destroy the previous chart instance if it exists and is a Chart
        if (window.financeChart instanceof Chart) {
          window.financeChart.destroy();
        }

        window.financeChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Registration', 'Activity Income', 'Ongoing Funds', 'Annual Party', 'Savings', 'School Support'],
            datasets: [{
              label: 'Funds (KES)',
              data: [
                f.total_registration,
                f.total_activity_income,
                f.ongoing_activities_fund,
                f.annual_party_fund,
                f.savings,
                f.school_contribution
              ],
              backgroundColor: '#007bff'
            }]
          }
        });

      })
      .catch(error => console.error('Failed to generate report:', error));
  }
  
  function downloadPDF() {
    const element = document.getElementById('report-section');
    
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `${document.getElementById('clubName').textContent}_financial_report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .save();
}

  
    // Load clubs dynamically
    function loadClubsForReport() {
      fetch('/api/get_clubs.php')
          .then(response => response.json())
          .then(clubs => {
              const clubSelector = document.getElementById('clubSelector');
              clubs.forEach(club => {
                  const option = document.createElement('option');
                  option.value = club.id;
                  option.textContent = club.name;
                  clubSelector.appendChild(option);
              });
          })
          .catch(error => console.error('Failed to load clubs:', error));
  }

  // Generate the events report for the selected club
  function generateEventReport(clubId) {
      fetch(`/api/get_club_event_report.php?club_id=${clubId}`)
          .then(response => response.json())
          .then(data => {
              const clubName = data.club_name;
              document.getElementById('clubName').textContent = `Club: ${clubName}`;

              // Fill the activity table
              document.getElementById('activityTable').innerHTML = data.activities.map(a => 
                  `<tr><td>${a.activity_name}</td><td>${a.date_of_activity}</td><td>${a.amount_collected}</td></tr>`
              ).join('');

              // Render the Event Frequency chart (bar chart for event counts per month)
              const eventFrequencyData = data.event_frequency;
              const eventFrequencyLabels = eventFrequencyData.map(e => e.month);
              const eventFrequencyCounts = eventFrequencyData.map(e => e.count);

              const ctxEventFrequency = document.getElementById('eventFrequencyChart').getContext('2d');
              new Chart(ctxEventFrequency, {
                  type: 'bar',
                  data: {
                      labels: eventFrequencyLabels,
                      datasets: [{
                          label: 'Event Frequency (per month)',
                          data: eventFrequencyCounts,
                          backgroundColor: '#28a745'
                      }]
                  }
              });

              // Render the Registration Growth chart (bar chart for year-to-year registration growth)
              const registrationGrowthData = data.registration_growth;
              const registrationGrowthYears = registrationGrowthData.map(r => r.year);
              const registrationGrowthCounts = registrationGrowthData.map(r => r.count);

              const ctxRegistrationGrowth = document.getElementById('registrationGrowthChart').getContext('2d');
              new Chart(ctxRegistrationGrowth, {
                  type: 'bar',
                  data: {
                      labels: registrationGrowthYears,
                      datasets: [{
                          label: 'Registration Growth',
                          data: registrationGrowthCounts,
                          backgroundColor: '#007bff'
                      }]
                  }
              });
          })
          .catch(error => console.error('Failed to generate report:', error));
  }
