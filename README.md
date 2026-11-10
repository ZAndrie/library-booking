# 🏛️ Library Operations Hub
### *Unified Discussion Room Booking & Laptop Borrowing Management System*

> **Staff & Admin Operations Portal**: An internal, dual-subsystem management system designed exclusively for Library Staff and Desk Administrators to manage walk-in / phone room reservations, conflict schedules, and counter laptop checkouts/returns.

---

## 🌟 Dual Subsystems Overview

This platform merges two essential library systems into one single administrative hub:

### 1. 🚪 Discussion Room Booking System (System 1)
* **Real-time Schedule Matrix**: Visualize room bookings by date, room, and status.
* **Double-Booking Conflict Prevention**: Atomic server-side overlap checks guarantee no two sessions can overlap in the same room.
* **Counter Desk Reservations**: Staff can create walk-in or phone reservations on behalf of students and faculty.
* **Instant Session Lifecycle Actions**:
  * **Check-out Room (Complete)**: Frees the room immediately when patrons leave early.
  * **Session Extension (+30m / +60m)**: Instantly extends the booking if no upcoming reservation conflicts.
  * **Cancellation & No-Show Tracking**.
* **Room Facilities & Capacity Catalog**: Configure rooms, seats, multimedia equipment (TV, HDMI, Projector, Whiteboards), and toggle maintenance mode.

### 2. 💻 Laptop Borrowing Management System (System 2)
* **Fast Counter Checkout Desk**: Scan/type Asset Tag (e.g., `LAP-001`), enter Student ID, set return due time, and check off accessories handed over (charger, sleeve, mouse).
* **Return & Condition Inspection Desk**: One-click check-in workflow where staff inspect hardware condition (`excellent`, `good`, `fair`, `damaged`) and log inspection notes.
* **Automatic Maintenance Routing**: If a device is checked in as `damaged`, its status is automatically moved to `under_maintenance` to prevent re-issuing.
* **Overdue Loan Radar**: Live alert table highlighting all active loans that have exceeded their due date, complete with student contact details.
* **Hardware Fleet Management**: Add new laptops to inventory, manage hardware specs, track serial numbers, and track shelf locations.

---

## 📁 Clean File Directory Separation (Frontend vs Backend)

The project is structured with an explicit separation between **Frontend** and **Backend** code:

```
Library-Booking/
├── src/
│   ├── backend/                        <-- 💻 100% BACKEND LOGIC
│   │   ├── auth/
│   │   │   └── jwt.ts                  # JWT token signing, verification & password hashing
│   │   ├── controllers/
│   │   │   ├── authController.ts       # Staff login, session & logout handlers
│   │   │   ├── dashboardController.ts  # Combined KPI metrics & activity feeds
│   │   │   ├── laptopController.ts     # Laptop hardware inventory CRUD
│   │   │   ├── laptopLoanController.ts # Checkouts, returns & overdue inspection logic
│   │   │   ├── roomBookingController.ts# Room reservations & overlap conflict detection
│   │   │   └── roomController.ts       # Discussion rooms & facilities configuration
│   │   ├── database/
│   │   │   └── db.ts                   # Cached Mongoose MongoDB connection pool
│   │   └── models/
│   │       ├── Laptop.ts               # Laptop inventory schema
│   │       ├── LaptopLoan.ts           # Loan transaction & return condition schema
│   │       ├── Room.ts                 # Discussion room schema
│   │       ├── RoomBooking.ts          # Room reservation schema
│   │       └── User.ts                 # Staff & Admin user schema
│   │
│   ├── frontend/                       <-- 🎨 100% FRONTEND UI & VIEWS
│   │   ├── components/
│   │   │   └── AppShell.tsx            # Global Navigation, live clock & staff status bar
│   │   ├── styles/
│   │   │   └── globals.css             # Tailwind base & theme CSS
│   │   └── views/
│   │       ├── DashboardView.tsx       # Unified Operations Hub view (KPIs & feeds)
│   │       ├── LaptopsView.tsx         # System 2: Laptop desk, overdue radar & inventory
│   │       ├── LoginView.tsx           # Staff & Admin sign-in screen (with 1-click demo)
│   │       └── RoomsView.tsx           # System 1: Discussion room schedules & reservations
│   │
│   ├── app/                            <-- 🌐 URL ROUTING CONNECTOR LAYER
│   │   ├── (web routes)                # Maps URL endpoints to frontend views
│   │   │   ├── layout.tsx              # Root HTML wrapper
│   │   │   ├── page.tsx                # '/' -> renders DashboardView
│   │   │   ├── rooms/page.tsx          # '/rooms' -> renders RoomsView
│   │   │   ├── laptops/page.tsx        # '/laptops' -> renders LaptopsView
│   │   │   └── login/page.tsx          # '/login' -> renders LoginView
│   │   └── api/                        # Maps REST endpoints to backend controllers
│   │       ├── auth/                   # /api/auth/*
│   │       ├── dashboard/              # /api/dashboard/*
│   │       ├── laptop-loans/           # /api/laptop-loans/*
│   │       ├── laptops/                # /api/laptops/*
│   │       ├── room-bookings/          # /api/room-bookings/*
│   │       └── rooms/                  # /api/rooms/*
│   │
│   └── middleware.ts                   # Route protection (redirects unauthenticated users)
│
├── scripts/
│   └── seed.mjs                        # Database seeder (sample rooms, laptops, loans)
├── .env.example                        # Template environment variables
├── .env.local                          # Local environment variables
└── package.json
```

---

## 🛠️ Tech Stack

* **Full-Stack Framework**: Next.js 14+ (App Router) with Node.js runtime.
* **Database & ODM**: MongoDB Atlas + Mongoose (with cached connection singleton for serverless).
* **Security & Auth**: Role-Based Access Control (`admin` & `staff`) via secure HTTP-Only JWT cookies and Next.js middleware.
* **Styling & UI**: Tailwind CSS + Lucide Icons (dark-themed operations dashboard).

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or v20.x+)
* [MongoDB](https://www.mongodb.com/) (Local MongoDB Community Server or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Ensure your `MONGODB_URI` points to your MongoDB instance:
```env
MONGODB_URI=mongodb://localhost:27017/library-booking
JWT_SECRET=super_secret_library_admin_jwt_key_2026
NODE_ENV=development
```

### 3. Seed the Database
Populate the database with sample discussion rooms, laptops, active test loans, and default Staff/Admin accounts:
```bash
npm run seed
```

#### 🔑 Pre-Configured Demo Accounts:
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@library.edu` | `admin123` | Full access, delete rooms/laptops, manage system |
| **Staff** | `staff@library.edu` | `staff123` | Room reservations, laptop checkout/check-in |

### 4. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
