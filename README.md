# VICTORY-SCHOOL-CLUB-MEMBERSHIP-SYSTEM

## REQUIREMENTS
- PHP version 8+
- MySQL

## SETUP AND RUN

### 1. Install PHP
- Download and install PHP from the official PHP website: [https://windows.php.net/download](https://windows.php.net/download)
- Ensure PHP is added to the system `PATH` during installation so you can run PHP commands from the command prompt.

### 2. Install PHP-MYSQLI Extension
- The `mysqli` extension is required to connect to MySQL. It is often included by default, but you can ensure it’s enabled by modifying your `php.ini` file:
  - Locate the `php.ini` file in your PHP installation folder.
  - Uncomment (remove the semicolon) the following line:
    ```ini
    extension=mysqli
    ```

### 3. Set Up MySQL
- Download and install MySQL from the official MySQL website: [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
- Follow the MySQL installation guide to complete the setup.

### 4. Import Database
- Create a new MySQL database for the system.
- Acesss the mysql terminal emulator
- Copy sql code and paste the press ```ENTER```
- This creates the database

### 5. Run the Application
- Navigate to the directory where the application is located.
- Start the PHP built-in server by running the following command:
    ```bash
    php -S localhost:8000
    ```

### 6. Access the Application
- Open your web browser and go to: [http://localhost:8000](http://localhost:8000)
- You should now see the Victory School Club Membership System running on your local server.

---

## ADDITIONAL INFORMATION

### Troubleshooting
- If you face any issues with PHP or MySQL connections, ensure that both services are running.
- Check your `php.ini` and `my.cnf` (MySQL config) files for any configuration issues.

### License
- This project is open-source and available under the [MIT License](LICENSE).

---

Enjoy managing your school club memberships efficiently with the Victory School Club Membership System!
