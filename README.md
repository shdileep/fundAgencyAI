# Funding Call Notice Board

A centralized web application that allows faculty and researchers to view, filter, and track active funding call opportunities, replacing scattered and delayed communication channels.

## Features

- Institutional login (no anonymous access)
- View funding calls categorized by Funding Agency, Deadline Month, and Department
- Admin dashboard for CRUD operations on funding calls
- Automatic archiving of calls after their deadline
- Scalable filter architecture for future categories

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT
- **Scheduling:** node-cron (auto-archiving)

## Data Model

Each funding call contains:

- Call ID
- Title
- Funding Agency
- Deadline Date
- Applicable Departments
- Description
- Attachment/URL
- Status (Active/Archived)
- Timestamps

## Installation

```bash
git clone https://github.com/<your-username>/funding-call-notice-board.git
cd funding-call-notice-board

# Backend
cd server
npm install
npm start

# Frontend
cd ../client
npm install
npm start
```

## Environment Variables

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/funding_call_board
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@institution.edu
ADMIN_PASSWORD=admin123
```

## API Endpoints

| Method | Endpoint            | Access     |
|--------|----------------------|------------|
| POST   | /api/auth/login       | Public     |
| GET    | /api/calls             | User/Admin |
| GET    | /api/calls/archived    | User/Admin |
| POST   | /api/calls               | Admin only |
| PUT    | /api/calls/:id          | Admin only |
| DELETE | /api/calls/:id          | Admin only |

## Demo Credentials

| Role  | Email                  | Password |
|-------|--------------------------|----------|
| User  | user@institution.edu     | user123  |
| Admin | admin@institution.edu    | admin123 |

## License

MIT
