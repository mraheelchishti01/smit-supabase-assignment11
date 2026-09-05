# 🦷 Apex Dental Care & Implant Clinic Management System

A modern, production-ready, full-stack web application for a dental clinic featuring a patient-facing portal, doctor schedules, interactive online appointment booking, inquiry management, and an administrative reception dashboard backed by Supabase PostgreSQL (with automatic local fallback).

---

## 🌟 Key Features

1. **Patient-Facing Dental Portal (`index.html`, `services.html`)**:
   - Modern, clinical aesthetic (Deep Teal `#0E7490`, Soft Aqua `#06B6D4`, Crisp Navy Slate, and Glassmorphism).
   - Emergency banner with telephone and WhatsApp direct triggers.
   - Comprehensive dental treatments showcase with pricing and procedure duration.
   - Before & After Smile transformation gallery.
   - Verified patient reviews and testimonials.
   - Board-certified specialist profiles.

2. **Interactive Online Booking Flow (`book-appointment.html`)**:
   - Dynamic service selection with real-time price guide.
   - Doctor preference selection with specialist matching.
   - Interactive date & time slot picker with collision detection.
   - Live booking summary card.
   - Instant confirmation receipt modal with booking reference ID.

3. **Patient Inquiry & Contact System (`contact.html`)**:
   - Clinic address, telephone hotline, emergency protocol.
   - Detailed operating hours schedule.
   - Interactive Google Map embed.
   - Working AJAX contact form submitting to the database.

4. **Staff & Reception Admin Dashboard (`admin.html`)**:
   - Real-time KPI cards: Total Bookings, Pending Approvals, Confirmed, Estimated Revenue.
   - Appointments table with status filters (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
   - One-click status transitions (Confirm, Complete, Cancel).
   - Real-time patient search by name, phone, or treatment.
   - 1-click Export to CSV.
   - Patient inquiries management with status toggles (`Resolved` / `Needs Response`).
   - Doctor rosters and shift schedules view.

5. **Dual Database Mode (Zero Friction)**:
   - Connects seamlessly to Supabase PostgreSQL when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`) are provided in `.env`.
   - Automatically initializes a high-fidelity local database with seed data if Supabase keys are not yet configured, allowing instant local testing and review!

---

## 🛠️ Tech Stack

- **Frontend:** Semantic HTML5, Bootstrap 5.3, Bootstrap Icons, Custom CSS Design System, Vanilla ES6+ JavaScript.
- **Backend:** Node.js (v20+), Express.js REST API layer with validation, CORS, and centralized error handling.
- **Database:** Supabase (PostgreSQL 15+) with Row-Level Security (RLS) and built-in seed store.
- **Deployment:** Vercel (`vercel.json`), Render (`render.yaml`), Railway (`Procfile`).

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: If you already have a Supabase project, paste your `SUPABASE_URL` and `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` into `.env`. If left empty, the application will run using the high-fidelity built-in store).*

### 3. Run Locally
```bash
npm start
```
Or in development watch mode:
```bash
npm run dev
```

Visit the application:
- **Patient Portal:** [http://localhost:3000](http://localhost:3000)
- **Book Appointment:** [http://localhost:3000/book-appointment.html](http://localhost:3000/book-appointment.html)
- **Treatments:** [http://localhost:3000/services.html](http://localhost:3000/services.html)
- **Contact:** [http://localhost:3000/contact.html](http://localhost:3000/contact.html)
- **Admin Control Panel:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **API Health Check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🗄️ Supabase Migration Setup

To deploy the database schema to your live Supabase project:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project or select an existing project.
3. Open the **SQL Editor** tab from the left sidebar.
4. Copy the entire contents of [`schema.sql`](./schema.sql) and paste it into the editor.
5. Click **Run**.
6. Retrieve your Project URL and API keys from **Project Settings -> API** and add them to your `.env` file or cloud host environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 📡 REST API Reference

### Public Endpoints
- `GET /api/services` — List all active dental treatments.
- `GET /api/services/:slug` — Get specific treatment specifications.
- `GET /api/doctors` — List all active dentists and working schedules.
- `POST /api/appointments` — Submit an appointment request.
  - **Body:** `{ patient_name, patient_email, patient_phone, service_id, doctor_id, appointment_date, appointment_time, notes }`
  - **Response 201:** `{ success: true, message: "...", data: { id, status: "Pending", ... } }`
- `POST /api/inquiries` — Submit a patient inquiry or question.

### Staff / Admin Endpoints
- `GET /api/admin/analytics` — Dashboard metrics (KPI counts, revenue estimate, popular treatments).
- `GET /api/admin/appointments` — Fetch all appointments with optional `?status=` and `?date=` query filters.
- `PATCH /api/admin/appointments/:id/status` — Update appointment status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
- `DELETE /api/admin/appointments/:id` — Delete an appointment record.
- `GET /api/admin/inquiries` — List all patient inquiries.
- `PATCH /api/admin/inquiries/:id/resolve` — Mark inquiry as resolved or active.

---

## 🚢 Cloud Deployment Guide

### Option 1: Vercel (Recommended for Serverless)
1. Install Vercel CLI: `npm install -g vercel` (or connect your GitHub repository to Vercel).
2. Run `vercel` in this project directory.
3. The included `vercel.json` automatically configures the Node.js API and static frontend assets.
4. Add your environment variables in the Vercel dashboard.

### Option 2: Render
1. Create a new Web Service on [Render](https://render.com).
2. Connect your Git repository.
3. Render will automatically detect `render.yaml` with build command `npm install` and start command `npm start`.
4. Enter your environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

### Option 3: Railway / Heroku
The repository contains a `Procfile`:
```
web: node src/server.js
```
Simply push to Railway or Heroku to launch.

---

## 🧪 Automated Testing
Run the automated test suite:
```bash
npm test
```
Tests validate API responses, validation rules, doctor slot collision prevention, and admin updates.
