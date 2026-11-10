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

## 🛠️ Tech Stack

* **Full-Stack Framework**: Next.js 14+ (App Router) with Node.js runtime.
* **Database & ODM**: MongoDB Atlas + Mongoose (with cached connection singleton for Vercel serverless functions).
* **Security & Auth**: Role-Based Access Control (`admin` & `staff`) via secure HTTP-Only JWT cookies and Next.js middleware.
* **Styling & UI**: Tailwind CSS + Lucide Icons (dark-themed operations dashboard).
* **Deployment Target**: Vercel (Edge network + Node.js serverless functions + Vercel Cron).

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or v20.x+)
* [MongoDB](https://www.mongodb.com/) (Local MongoDB Community Server or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 2. Clone and Install Dependencies
```bash
cd Library-Booking
npm install
```

### 3. Configure Environment Variables
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

### 4. Seed the Database
Populate the database with sample discussion rooms, laptops, active test loans, and default Staff/Admin accounts:
```bash
npm run seed
```

#### 🔑 Pre-Configured Demo Accounts:
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@library.edu` | `admin123` | Full access, delete rooms/laptops, manage system |
| **Staff** | `staff@library.edu` | `staff123` | Room reservations, laptop checkout/check-in |

### 5. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploying to Vercel

1. **Set up MongoDB Atlas (Cloud Database)**:
   * Create a free M0 cluster on [MongoDB Atlas](https://cloud.mongodb.com).
   * In *Network Access*, add `0.0.0.0/0` (Allow Access from Anywhere) so Vercel serverless lambdas can connect.
   * In *Database Access*, create a database user and copy the connection string:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/library-booking?retryWrites=true&w=majority`

2. **Deploy to Vercel**:
   * Push your project to GitHub or GitLab.
   * Import the repository in [Vercel](https://vercel.com/new).
   * Under **Environment Variables**, add:
     * `MONGODB_URI`: Your MongoDB Atlas connection string.
     * `JWT_SECRET`: A strong random string for signing JWT tokens.
     * `NODE_ENV`: `production`
   * Click **Deploy**.

3. **Seed Cloud Database**:
   You can run the seed script pointing to your Atlas URI once:
   ```bash
   MONGODB_URI="your_atlas_connection_string" npm run seed
   ```

---

## 📁 Project Structure

```
├── scripts/
│   └── seed.mjs                   # Automated database seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # Login, Logout, Session check
│   │   │   ├── dashboard/stats/   # Dual-system KPI metrics
│   │   │   ├── laptop-loans/      # Checkout, Return, Overdue API
│   │   │   ├── laptops/           # Laptop fleet CRUD
│   │   │   ├── room-bookings/     # Room reservation & conflict engine
│   │   │   └── rooms/             # Room inventory CRUD
│   │   ├── laptops/page.tsx       # System 2: Laptop Borrowing Desk UI
│   │   ├── rooms/page.tsx         # System 1: Discussion Room Booking UI
│   │   ├── login/page.tsx         # Staff Sign-in Portal with 1-click Demo
│   │   ├── layout.tsx             # Root Layout
│   │   └── page.tsx               # Unified Operations Dashboard
│   ├── components/
│   │   └── AppShell.tsx           # Global Navigation & Staff Status Bar
│   ├── lib/
│   │   ├── auth.ts                # JWT and Password encryption utilities
│   │   └── mongodb.ts             # Serverless cached Mongoose connection pool
│   ├── models/
│   │   ├── Laptop.ts              # Laptop hardware inventory schema
│   │   ├── LaptopLoan.ts          # Laptop loan & inspection ledger schema
│   │   ├── Room.ts                # Discussion room schema
│   │   ├── RoomBooking.ts         # Room reservation schema
│   │   └── User.ts                # Staff & Admin user schema
│   └── middleware.ts              # Route protection middleware
├── vercel.json                    # Vercel configuration & scheduled crons
└── package.json
```
