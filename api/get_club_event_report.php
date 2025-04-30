<?php
include 'db_connection.php'; // Include the database connection

// Check if club_id is passed in the URL
$club_id = $_GET['club_id'] ?? null;

if ($club_id) {
    // Get club name
    $club_query = "SELECT name FROM clubs WHERE id = ?";
    $stmt = mysqli_prepare($conn, $club_query);
    mysqli_stmt_bind_param($stmt, "i", $club_id); // Binding the club_id
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $club = mysqli_fetch_assoc($result);

    if ($club) {
        // Get club activity data
        $activity_query = "
            SELECT activity_name, date_of_activity, amount_collected 
            FROM club_activities 
            WHERE club_id = ? 
            ORDER BY date_of_activity DESC";
        $stmt = mysqli_prepare($conn, $activity_query);
        mysqli_stmt_bind_param($stmt, "i", $club_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $activities = mysqli_fetch_all($result, MYSQLI_ASSOC);

        // Get event frequency (events per month)
        $event_frequency_query = "
            SELECT MONTH(date_of_activity) AS month, COUNT(*) AS count
            FROM club_activities 
            WHERE club_id = ? 
            GROUP BY MONTH(date_of_activity) 
            ORDER BY month";
        $stmt = mysqli_prepare($conn, $event_frequency_query);
        mysqli_stmt_bind_param($stmt, "i", $club_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $event_frequency = mysqli_fetch_all($result, MYSQLI_ASSOC);

        // Get registration growth (students joined by year)
        $registration_growth_query = "
            SELECT year, COUNT(*) AS count 
            FROM memberships 
            WHERE club_id = ? 
            GROUP BY year 
            ORDER BY year";
        $stmt = mysqli_prepare($conn, $registration_growth_query);
        mysqli_stmt_bind_param($stmt, "i", $club_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $registration_growth = mysqli_fetch_all($result, MYSQLI_ASSOC);

        // Prepare response
        $response = [
            'club_name' => $club['name'],
            'activities' => $activities,
            'event_frequency' => $event_frequency,
            'registration_growth' => $registration_growth
        ];

        echo json_encode($response);
    } else {
        echo json_encode(['error' => 'Club not found']);
    }
} else {
    echo json_encode(['error' => 'Club ID is required']);
}
?>
