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
```

You should see:

➜  Local:   http://localhost:5173/


### Open in Browser

Navigate to: **http://localhost:5173**

