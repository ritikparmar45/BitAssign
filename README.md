# Bitespeed Identity Reconciliation - Backend Task

This project implements an identity reconciliation service for a hypothetical e-commerce platform using **Node.js, Express, and MySQL (Raw SQL)**.

## 🚀 Overview
The system identifies when multiple contact details (emails and phone numbers) belong to the same person and links them under a single "primary" contact.

### Features
- **Primary vs Secondary Tracking**: Automatically manages `linkPrecedence`.
- **Deep Merging**: Merges entire clusters when a new piece of information links two previously separate clusters.
- **Raw SQL Efficiency**: Uses `mysql2/promise` with no ORM for performance and control.
- **Clean Response Format**: Follows the exact required JSON structure.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Driver**: `mysql2/promise`
- **Environment**: `dotenv`

---

## ⚙️ Initial Setup

### 1. Database Configuration
Run the following SQL in your MySQL environment:
```sql
CREATE DATABASE IF NOT EXISTS bitespeed_db;
USE bitespeed_db;

CREATE TABLE Contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phoneNumber VARCHAR(20),
  email VARCHAR(255),
  linkedId INT NULL,
  linkPrecedence ENUM('primary', 'secondary') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL
);
```

### 2. Environment Variables
Create a `.env` file from the placeholder (it's ignored by Git for security):
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=bitespeed_db
PORT=3000
```

### 3. Installation
```bash
npm install
```

---

## 🏃 Running the Application
- **Development Mode** (with auto-restart):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```
The server will start on `http://localhost:3000`.

---

## 🧪 Testing the Endpoint
Send a **POST** request to `http://localhost:3000/identify` with JSON:

### Example Request Body
```json
{
  "email": "mcfly@hillvalley.com",
  "phoneNumber": "123456"
}
```

### Example Response Body
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["mcfly@hillvalley.com", "george@hillvalley.com"],
    "phoneNumbers": ["123456", "789012"],
    "secondaryContactIds": [2, 3]
  }
}
```

---

## 📂 Project Structure
```text
├── config/
│   └── db.js         # MySQL connection pool
├── routes/
│   └── identify.js   # Reconciliation logic (POST /identify)
├── server.js         # Express app entry point
├── .env              # Secrets (ignored by git)
├── .gitignore        # Git ignore list
├── package.json      # Dependencies and scripts
└── README.md         # Documentation
```
