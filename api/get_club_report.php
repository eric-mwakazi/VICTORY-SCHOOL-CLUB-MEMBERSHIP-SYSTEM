<?php
header('Content-Type: application/json');

// Connect to the database
include 'db_connection.php';

$club_id = isset($_GET['club_id']) ? $_GET['club_id'] : die('Club ID is required');

// Query to get club details
$club_query = "SELECT name FROM clubs WHERE id = ?";
$stmt = $conn->prepare($club_query);
$stmt->bind_param('i', $club_id);
$stmt->execute();
$result = $stmt->get_result();
$club = $result->fetch_assoc();

// Query to get club finances
$finances_query = "SELECT total_registration, total_activity_income, ongoing_activities_fund, annual_party_fund, savings, school_contribution 
                   FROM club_finances WHERE club_id = ?";
$stmt = $conn->prepare($finances_query);
$stmt->bind_param('i', $club_id);
$stmt->execute();
$finances_result = $stmt->get_result();
$finances = $finances_result->fetch_assoc();

// Query to get club activities
$activities_query = "SELECT activity_name, date_of_activity, amount_collected FROM club_activities WHERE club_id = ?";
$stmt = $conn->prepare($activities_query);
$stmt->bind_param('i', $club_id);
$stmt->execute();
$activities_result = $stmt->get_result();

$activities = [];
$activityNames = [];
$activityFrequencies = [];

while ($activity = $activities_result->fetch_assoc()) {
    $activities[] = $activity;
    $activityNames[] = $activity['activity_name'];
    // Count the frequency of each activity
    if (!isset($activityFrequencies[$activity['activity_name']])) {
        $activityFrequencies[$activity['activity_name']] = 0;
    }
    $activityFrequencies[$activity['activity_name']]++;
}

// Query to get registration growth (total registrations per year)
$registration_growth_query = "SELECT YEAR(date_joined) AS year, COUNT(*) AS total_registrations 
                              FROM memberships WHERE club_id = ? GROUP BY YEAR(date_joined)";
$stmt = $conn->prepare($registration_growth_query);
$stmt->bind_param('i', $club_id);
$stmt->execute();
$registration_growth_result = $stmt->get_result();

$registrationYears = [];
$registrationGrowth = [];

while ($row = $registration_growth_result->fetch_assoc()) {
    $registrationYears[] = $row['year'];
    $registrationGrowth[] = $row['total_registrations'];
}

// Prepare the final data to send back
$response = [
    'club_name' => $club['name'],
    'finances' => $finances,
    'activities' => $activities,
    'activityNames' => $activityNames,
    'activityFrequencies' => array_values($activityFrequencies),
    'registrationYears' => $registrationYears,
    'registrationGrowth' => $registrationGrowth
];

echo json_encode($response);
?>
