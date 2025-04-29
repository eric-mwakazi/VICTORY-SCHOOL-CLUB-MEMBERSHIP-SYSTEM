// Load navbar
fetch('html/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
  });

// Load footer
fetch('html/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;

// Set year AFTER footer is loaded
var yearSpan = document.getElementById("year");
    if (yearSpan) {
    var year = new Date().getFullYear();
    yearSpan.innerHTML = year;
    }
});
