-- DATABASE: victory_school_clubs
CREATE DATABASE victory_school_clubs;
USE victory_school_clubs;

-- Table: clubs
CREATE TABLE clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    patron_name VARCHAR(100) NOT NULL,
    registration_fee INT NOT NULL
);

-- Table: students
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admission_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(5) NOT NULL
);

-- Table: memberships
CREATE TABLE memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    club_id INT,
    role ENUM('Regular', 'Executive') DEFAULT 'Regular',
    year YEAR NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Table: club_activities
CREATE TABLE club_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT,
    activity_name VARCHAR(100) NOT NULL,
    date_of_activity DATE NOT NULL,
    amount_collected INT NOT NULL,
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Table: club_finances
CREATE TABLE club_finances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT,
    total_registration INT DEFAULT 0,
    total_activity_income INT DEFAULT 0,
    ongoing_activities_fund INT DEFAULT 0,
    annual_party_fund INT DEFAULT 0,
    savings INT DEFAULT 0,
    school_contribution INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);
