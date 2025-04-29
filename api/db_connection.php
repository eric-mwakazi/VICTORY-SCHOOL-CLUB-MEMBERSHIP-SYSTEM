<?php
// db_connection.php

$host = 'localhost';  // Your database host (usually localhost)
$username = 'root';   // Your MySQL username (default is root for XAMPP)
$password = '';       // Your MySQL password (empty for default in XAMPP)
$dbname = 'memorial_service';  // Your database name

// Create a MySQL connection
$conn = mysqli_connect($host, $username, $password, $dbname);

// Check if the connection is successful
if (!$conn) {
    // If the connection fails, stop the script and show the error
    die("Connection failed: " . mysqli_connect_error());
}
?>