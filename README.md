# Employee Management System

A full-stack Employee Management System built using Node.js, Express.js, MySQL, HTML, CSS, and JavaScript.

## Features

- User authentication using JWT.
- Role-based access control (Admin and User).
- Employee management.
- Department management.
- User account management.
- Password hashing using bcryptjs.
- MySQL database integration.
- RESTful API architecture.
- Protected API routes.
- Session invalidation after password reset.
- Responsive web interface.

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

### 1. Clone the repository

```bash
git clone https://github.com/alaa483/employee-management-system.git
cd employee-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=company_db
JWT_SECRET=YOUR_SECRET_KEY
JWT_EXPIRES_IN=1h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
```

Replace the placeholder values with your own settings. Use a strong password and a secure JWT secret. Never publish your `.env` file.

### 4. Set up the database

Run `database.sql` using MySQL Workbench to create the database and required tables.

### 5. Create the initial administrator

Run this command only when the database does not already contain an administrator:

```bash
npm run create-admin
```

The script will refuse to create another administrator if one already exists.

### 6. Start the application

```bash
npm start
```

### 7. Open the application

Visit:

http://localhost:3000

## Security

- Passwords are hashed before storage.
- JWT authentication protects private routes.
- Role-based authorization restricts sensitive operations.
- SQL queries use parameterized statements.
- Password reset invalidates existing user sessions.

## License

ISC