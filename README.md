# ESS HelpDesk — IT Help Request Tracking System

A full-stack IT helpdesk system built for the **Ethiopian Statistical Service (ESS)**.  
Supports ticket submission, department-based assignment, and role-based access control.

---

## Tech Stack

**Backend:** Node.js, Express 5, MongoDB, Mongoose 9, JWT  
**Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7  

---

## Roles

| Role | Access |
|---|---|
| Admin | Full access — manages users, teams, officers, all tickets |
| Senior Officer | Sees only tickets assigned to their department |
| Submitter | Creates and tracks their own tickets |

---

## Features

- JWT authentication with remember-me support
- Role-based route protection
- Department-based ticket assignment (Hardware, Software, Network, Account Access, Other)
- Ticket lifecycle — Open → In Progress → Closed
- Status history tracking
- Comments on tickets
- Email notifications on ticket updates
- File attachments on tickets
- Dark mode support
- Admin panel — manage users, departments, officers
- Password reset via email
- Rate limiting on auth endpoints

---

## Project Structure

```
it-helpdesk/
├── backend/
│   ├── controllers/      # Business logic
│   ├── middleware/        # Auth, validation, upload
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── scripts/           # Seed scripts
│   └── utils/             # Email service
└── frontend/
    └── src/
        ├── components/    # Layout, Navbar, ErrorBoundary
        ├── context/       # Auth, Theme
        ├── pages/         # All page components
        ├── services/      # Axios API client
        └── utils/         # Badge helpers
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/it-helpdesk.git
cd it-helpdesk
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
```

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL
npm install
```

### 4. Seed the database
```bash
cd backend
node scripts/seedTeams.js    # creates the 5 departments
node scripts/createAdmin.js  # creates the admin account
```

### 5. Run in development
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

App runs at `http://localhost:3000`

---

## Default Admin Credentials

```
Email:    admin@helpdesk.com
Password: Admin@1234
```

> Change the password immediately after first login.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a long random string) |
| `JWT_EXPIRE` | Token expiry e.g. `7d` |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port (587 for TLS) |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password or app password |
| `EMAIL_FROM` | Sender email address |
| `FRONTEND_URL` | Frontend URL for CORS and email links |
| `PORT` | Server port (default 5000) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL — use `/api` with Vite proxy in dev |

---



## License

MIT
