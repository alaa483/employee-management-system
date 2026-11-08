
# Employee Management System

A full-stack Employee Management System built using Node.js, Express.js, MySQL, HTML, CSS, and JavaScript.

## Features

- User authentication using JWT.
- Role-based access control (Admin and User).
- Employee management.
- Department management.
- User account management.
- Password hashing using bcrypt.
- MySQL database integration.
- RESTful API architecture.
- Protected API routes.
- Session invalidation after password reset.

## User Roles

### Admin
- View employees and departments.
- Add, edit, and delete employees.
- Add, edit, and delete departments.
- Create user accounts.
- View all users.
- Change user roles.
- Reset user passwords.

### User
- View employees and departments.
- Add employees.
- Add departments.
- Cannot edit or delete records.
- Cannot access user management settings.

## Technologies Used

- Node.js
- Express.js
- MySQL
- JavaScript
- HTML5
- CSS3
- JSON Web Token (JWT)
- bcryptjs

## Installation

1. Clone the repository:

   git clone YOUR_REPOSITORY_URL

2. Navigate to the project directory:

   cd employee-management-system

3. Install dependencies:

   npm install

4. Create a `.env` file in the project root:

   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_DATABASE_PASSWORD
   DB_NAME=company_db
   JWT_SECRET=YOUR_SECRET_KEY
   JWT_EXPIRES_IN=1h

5. Create the MySQL database and required tables.

6. Start the application:

   npm start

7. Open your browser:

   http://localhost:3000

## Security

- Passwords are hashed before storage.
- JWT authentication protects private routes.
- Role-based authorization restricts sensitive operations.
- SQL queries use parameterized statements.

## License

ISC
