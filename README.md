# VS Code Setup Guide
HRMS Lite is a lightweight full-stack Human Resource Management System designed to manage employee records and track daily attendance. The application provides a clean and professional admin interface for performing essential HR operations such as employee management and attendance tracking.

This project demonstrates practical full-stack development skills, including frontend UI development, RESTful API design, database integration, validation handling, and deployment of a production-ready web application.

The system focuses on delivering a simple, stable, and usable HR tool rather than complex enterprise features.

## Key Features

Add, view, and delete employee records

Track daily employee attendance (Present / Absent)

RESTful backend APIs

Database persistence for employees and attendance

Input validation and error handling

Clean and responsive UI

Modular and maintainable code structure

## Tech Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

Backend

Node.js

Express.js

Database

MongoDB
# VS Code Setup Guide
This guide will help you set up and run the HRMS Lite application in Visual Studio Code.

# Project Structure

hrms-lite/
├── hrms-backend/     # Backend API (Node.js + Express)
├── app/              # Frontend (React + TypeScript)
├── README.md         # Full documentation
└── SETUP.md          # This file


open two terminal

 Step 2: Start Backend (Terminal 1)

```bash
cd hrms-backend
npm install --no-bin-links
npm start
```

You should see:
```
HRMS Backend Server running on port 3001
API Base URL: http://localhost:3001/api
```

### Step 3: Start Frontend (Terminal 2)

```bash
cd app
npm install
npm run dev


You should see:

➜  Local:   http://localhost:5173/


### Open in Browser

Navigate to: **http://localhost:5173**

