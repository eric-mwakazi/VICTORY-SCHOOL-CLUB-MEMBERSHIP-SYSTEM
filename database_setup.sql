
-- prepares a MySQL server for the project
DROP DATABASE IF EXISTS victory_school_clubs;
CREATE DATABASE IF NOT EXISTS victory_school_clubs;
CREATE USER IF NOT EXISTS 'victory_school_clubs'@'localhost' IDENTIFIED BY 'victory_school_clubs';
GRANT ALL PRIVILEGES ON `victory_school_clubs`.* TO 'victory_school_clubs'@'localhost';
GRANT SELECT ON `performance_schema`.* TO 'victory_school_clubs'@'localhost';
FLUSH PRIVILEGES;

-- DATABASE: victory_school_clubs
USE victory_school_clubs;

-- Table: clubs
CREATE TABLE clubs (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    patron_name VARCHAR(100) NOT NULL,
    registration_fee INT NOT NULL
);

-- Table: students
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
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


-- Insert into clubs
INSERT INTO clubs (name, patron_name, registration_fee) VALUES
('Science Club', 'Mr. Otieno', 500),
('Drama Club', 'Ms. Wanjiku', 300),
('Debate Club', 'Mr. Mutua', 400);

-- Insert into students
INSERT INTO students (admission_no, name, class) VALUES
('ADM001', 'Alice Achieng', '4B'),
('ADM002', 'Brian Kiprotich', '3A'),
('ADM003', 'Cynthia Mwangi', '2C'),
('ADM004', 'David Njoroge', '1D');

-- Insert into memberships
INSERT INTO memberships (student_id, club_id, role, year) VALUES
(1, 1, 'Executive', 2024),
(2, 1, 'Regular', 2024),
(3, 2, 'Executive', 2024),
(4, 3, 'Regular', 2024);

-- Insert into club_activities
INSERT INTO club_activities (club_id, activity_name, date_of_activity, amount_collected) VALUES
(1, 'Science Fair', '2024-03-15', 1500),
(2, 'Drama Festival', '2024-04-10', 1200),
(3, 'Debate Championship', '2024-05-05', 800);

-- Insert into club_finances
INSERT INTO club_finances (club_id, total_registration, total_activity_income, ongoing_activities_fund, annual_party_fund, savings, school_contribution) VALUES
(1, 1000, 1500, 700, 300, 500, 200),
(2, 600, 1200, 400, 300, 300, 100),
(3, 400, 800, 300, 200, 250, 150);

