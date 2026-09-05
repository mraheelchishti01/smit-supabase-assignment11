# AGENT.MD — DENTAL CLINIC WEB APPLICATION SPECIFICATION

## 1. Project Overview & Role Definition
- **Project Name:** Apex Dental Care & Implant Clinic Management System
- **Role:** Full-Stack AI Engineer & System Architect
- **Mission:** Build a modern, responsive, production-ready full-stack website for a dental clinic featuring a patient-facing portal, doctor schedules, online appointment booking, contact inquiry management, and an administrative dashboard backed by Supabase.

---

## 2. Business Requirements
### 2.1 Core Objectives
- **Brand Presence & Trust:** Showcase clinic credibility, dentist qualifications, hygiene standards, patient testimonials, before/after smile transformations, and available dental treatments.
- **Online Appointment Booking:** Allow patients to select dental services (e.g., Teeth Whitening, Root Canal, Orthodontics, Scaling, Dental Implants), select preferred dentist, choose date/slot, and submit appointment requests.
- **Appointment Lifecycle Management:** Status workflow for appointments: `Pending` -> `Confirmed` -> `Completed` -> `Cancelled`.
- **Patient Inquiry & Contact:** Emergency dental contact numbers, Google Maps location, opening hours, WhatsApp direct chat integration, and an online inquiry form.
- **Admin Dashboard (Role-based):** Clinic staff/admin can:
  - View, approve, reschedule, or cancel bookings.
  - Manage dental services, pricing, and descriptions.
  - View patient messages and inquiries.
  - Track basic analytics (daily/weekly appointments, popular treatments).

### 2.2 Target Audience
- New patients seeking specialized dental care or routine checkups.
- Existing patients scheduling follow-ups.
- Clinic administrators and receptionists managing daily schedules.

---

## 3. Technical Architecture & Tech Stack

### 3.1 Architecture Overview
- **Client Tier:** Static/Server-rendered templates with Bootstrap 5, Vanilla JavaScript (ES6+), custom CSS.
- **Server Tier:** Node.js with Express.js REST API layer handling validation, business logic, CORS, rate limiting, and Supabase interaction.
- **Database Tier:** Supabase (PostgreSQL) handling relations, Row-Level Security (RLS), real-time updates, and authentication.
- **Hosting Tier:** Vercel / Render / Railway for Node.js backend; Static hosting or unified Express serving for frontend.

### 3.2 Detailed Tech Stack
| Component | Technology | Version / Specification |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic HTML, SEO-optimized tags, Open Graph meta |
| **Styling** | CSS3 & Bootstrap 5 | Bootstrap v5.3.x, Bootstrap Icons, Custom responsive CSS |
| **Client Scripting** | JavaScript | Modern ES6+, Fetch API, Client-side validation |
| **Runtime & Server**| Node.js & Express.js | Node.js v20 LTS, Express v4.19+ |
| **Database & Auth** | Supabase | PostgreSQL 15+, `@supabase/supabase-js` v2 |
| **Environment** | Dotenv | `.env` for secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`) |

---

## 4. Design System, Color Scheme & Typography

### 4.1 Color Scheme
Designed specifically for a clean, clinical, calming, and high-trust dental atmosphere:
- **Primary Teal / Deep Cyan (`#0E7490`):** Core brand color representing clinical expertise and calm hygiene.
- **Secondary Turquoise / Soft Aqua (`#06B6D4`):** Accent color for CTA buttons, badges, and hover states.
- **Clean Background Tint (`#F8FAFC` / `#FFFFFF`):** Crisp, sterile, ultra-clean clinical look.
- **Dark Slate Navy (`#0F172A`):** Deep, high-contrast typography for legibility.
- **Muted Cool Gray (`#64748B`):** Secondary body text, subheadings, and borders (`#E2E8F0`).
- **Success Mint (`#10B981`):** Confirmed appointments and positive notifications.
- **Warning Amber (`#F59E0B`):** Pending review alerts.
- **Danger Coral (`#EF4444`):** Emergency dental alerts, cancellations, errors.

### 4.2 Typography
- **Primary Headings Font:** `Plus Jakarta Sans` or `Montserrat` (Clean geometric sans-serif for modern authority).
- **Body & Interface Font:** `Inter` or `Open Sans` (Optimized for readability across all screen densities).
- **Fallback Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- **Typographic Scale:**
  - `Display / Hero`: 40px - 48px (SemiBold / Bold)
  - `H1 / Section Titles`: 28px - 32px (Bold)
  - `H2 / Card Headers`: 20px - 24px (SemiBold)
  - `Body Text`: 15px - 16px (Regular / Line Height 1.6)
  - `Small / Metadata`: 12px - 14px (Medium)

---

## 5. Database Schema (Supabase / PostgreSQL)

### 5.1 Tables Specification

```sql
-- 1. Services Table
CREATE TABLE dental_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT DEFAULT 30,
    price_range VARCHAR(50),
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Doctors / Dentists Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    qualifications VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 5,
    bio TEXT,
    available_days TEXT[], -- e.g. ['Monday', 'Tuesday', 'Friday']
    shift_start TIME DEFAULT '09:00',
    shift_end TIME DEFAULT '18:00',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name VARCHAR(150) NOT NULL,
    patient_email VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(25) NOT NULL,
    service_id UUID REFERENCES dental_services(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contact Inquiries Table
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(25),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Supabase Security & RLS
- **Public access:** Allow `INSERT` on `appointments` and `inquiries`; allow `SELECT` on `dental_services` and `doctors`.
- **Authenticated admin access:** Full `CRUD` on `appointments`, `doctors`, `dental_services`, and `inquiries` via Supabase Service Role Key or Supabase Auth.

---

## 6. Project Structure & Coding Standards

```
dental-clinic-system/
│
├── public/                     # Static Frontend Assets
│   ├── css/
│   │   ├── style.css           # Custom CSS overriding Bootstrap
│   │   └── admin.css           # Dedicated Admin styles
│   ├── js/
│   │   ├── main.js             # Client interactivity (booking modal, animations)
│   │   ├── booking.js          # Form validation, API calls to backend
│   │   └── admin.js            # Dashboard rendering & status triggers
│   ├── images/                 # Clinic photos, treatment icons, logos
│   ├── index.html              # Home Page (Hero, Treatments, Team, Reviews)
│   ├── services.html           # Detailed Dental Services Page
│   ├── book-appointment.html   # Dedicated Booking Flow
│   ├── contact.html            # Contact info, map, inquiry form
│   └── admin.html              # Admin Control Panel
│
├── src/                        # Backend Source Code (Node.js/Express)
│   ├── config/
│   │   └── supabase.js         # Supabase client initialization
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   ├── serviceController.js
│   │   └── inquiryController.js
│   ├── routes/
│   │   ├── apiRoutes.js        # REST endpoints (/api/appointments, etc.)
│   │   └── adminRoutes.js      # Protected admin actions
│   ├── middlewares/
│   │   ├── errorHandler.js     # Centralized error handler
│   │   └── authMiddleware.js   # Supabase JWT / Session validator
│   └── server.js               # Express application entry point
│
├── .env.example                # Sample environment variables
├── .gitignore
├── package.json
├── README.md
└── agent.md                    # Instructions & Project Blueprint for AI Agent
```

### 6.1 Coding Preferences & Guidelines
- **HTML:** Semantic structure (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`). Accessible forms with associated `<label>` and ARIA attributes.
- **CSS / Bootstrap:** Use Bootstrap 5 utility classes for layout, flexbox, grid, and responsiveness. Custom CSS reserved for brand palette, soft card shadows, smooth transitions (`0.3s ease-in-out`), and custom badges.
- **JavaScript:** ES6+ modules or clean functional scripts. Native `fetch` with `async/await` and robust `try/catch` error handling with user feedback (toasts/alerts).
- **Node.js / Express:** Clean MVC architecture. Input sanitization (e.g. `express-validator`). Strict separation between database queries, business logic, and HTTP routing.

---

## 7. Testing Methodology

### 7.1 Unit & Functional Testing
- **API Endpoints:** Test with Supertest/Jest:
  - `POST /api/appointments` with valid data returns `201`.
  - `POST /api/appointments` with invalid email/phone returns `400` with descriptive error messages.
  - `GET /api/services` returns cached or active services array.
- **Frontend Validation:** Validate all form fields client-side before sending network requests (Phone format, Future appointment date only, Sanitized text input).

### 7.2 Integration & Database Testing
- Verify Supabase client connection with valid and invalid credentials.
- Test concurrency: verify doctor availability check prevents duplicate bookings for the same time slot.
- Test Row-Level Security (RLS) policies to prevent unauthorized data reads.

### 7.3 Cross-Browser & Responsiveness Testing
- Verify layout consistency on Chrome, Firefox, Safari, and Edge.
- Verify mobile responsiveness on iPhone (iOS Safari) and Android (Chrome) screens from 360px up to 4K displays.

---

## 8. Documentation Standards

### 8.1 API Documentation
Every REST endpoint must follow this pattern:
- **`POST /api/appointments`**
  - **Body:** `{ patient_name, patient_email, patient_phone, service_id, doctor_id, appointment_date, appointment_time, notes }`
  - **Response 201:** `{ success: true, message: "Appointment request received", data: { id, status: "Pending" } }`
  - **Response 400:** `{ success: false, error: "Validation failed", details: [...] }`
  - **Response 500:** `{ success: false, error: "Internal Server Error" }`

### 8.2 Developer & Setup Guide (`README.md`)
- Step-by-step installation instructions (`npm install`).
- Environment variable configuration guide (`.env.example`).
- Supabase SQL schema migration script.
- Local startup commands (`npm run dev` / `npm start`).

---

## 9. Deployment Strategy

### 9.1 Backend (Node.js / Express)
- Hosted on **Render**, **Railway**, or **Vercel Serverless Functions**.
- Environment variables configured securely in provider dashboard.
- Automatic deploy triggers linked to the `main` GitHub branch.

### 9.2 Frontend Assets
- Can be served directly via Express static middleware (`express.static('public')`) or hosted separately on **Netlify** / **Vercel** / **Cloudflare Pages**.

### 9.3 Database (Supabase)
- Cloud-hosted managed PostgreSQL instance on Supabase.
- Enable automatic daily database backups.
- Enable connection pooling (PgBouncer) for high traffic resilience.

---

## 10. Final Output Format & Deliverables Checklist
When executing this prompt, the AI Agent must deliver:
1. `agent.md` (This master blueprint and configuration file).
2. Fully documented Supabase SQL schema (`schema.sql`).
3. Complete Node.js / Express backend code with Supabase integration (`server.js`, controllers, routes).
4. Responsive Frontend files (`index.html`, `book-appointment.html`, `admin.html`, `style.css`, `booking.js`).
5. Complete `package.json` with all necessary dependencies (`express`, `@supabase/supabase-js`, `dotenv`, `cors`).
6. `.env.example` file specifying all required keys.
