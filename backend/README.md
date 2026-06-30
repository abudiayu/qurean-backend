# Noor Academy — Backend API

Node.js + Express server that sits between the React frontend and Supabase.
The **secret key** lives only here — never in the browser.

## Folder structure

```
backend/
├── src/
│   ├── index.js              ← Express entry point
│   ├── lib/
│   │   └── supabase.js       ← Admin client (secret key)
│   ├── services/
│   │   ├── baseService.js    ← Generic CRUD factory
│   │   ├── studentsService.js
│   │   ├── paymentsService.js
│   │   ├── authService.js
│   │   └── storageService.js
│   ├── routes/
│   │   ├── students.js
│   │   ├── payments.js
│   │   ├── auth.js
│   │   └── storage.js
│   ├── middleware/
│   │   ├── auth.js           ← JWT verification
│   │   └── errorHandler.js
│   └── utils/
│       ├── errors.js
│       └── response.js
├── .env                      ← Secret key lives here only
└── package.json
```

## Setup

```bash
cd backend
npm install
npm run dev      # starts with --watch (auto-restart on change)
```

Server runs on **http://localhost:4000**

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/students | List students |
| GET | /api/students/:id | Get student |
| GET | /api/students/:id/payments | Student + payments |
| POST | /api/students | Create student |
| PATCH | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| GET | /api/payments | List payments |
| GET | /api/payments/total | Total collected |
| GET | /api/payments/unpaid | Unpaid students |
| GET | /api/payments/period | Payments by period |
| POST | /api/payments | Record payment |
| PATCH | /api/payments/:id | Update payment |
| DELETE | /api/payments/:id | Delete payment |
| POST | /api/storage/upload | Upload file |
| GET | /api/storage/signed/* | Signed URL |
| DELETE | /api/storage/* | Delete file |

All routes except `/health` require `Authorization: Bearer <jwt>`.
