# Workdone — Professional Home Services Marketplace

> **"Find the Right Professional. Get the Job Done Right."**

Workdone is a full-stack, production-quality home-services marketplace connecting homeowners and property managers with verified local craftspeople and contractors. Built with clean architecture, strict database normalization, role-based security, itemized estimate workflows, verified-job reviews, and an administrative moderation panel.

---

## 1. Product Vision & Architecture

### The Problem
Finding reliable, available, and transparently priced professionals for home projects is challenging. Homeowners often rely on unvetted word-of-mouth recommendations, cannot evaluate verified portfolios or previous work, and lack clarity around estimates and completion timelines.

### The Workdone Solution
Workdone delivers an end-to-end platform where:
1. **Customers** discover local specialists, filter by trade/experience/rating, compare up to 4 professionals side-by-side, request bookings without revealing private phone numbers, accept itemized estimates, and publish verified reviews after jobs are completed.
2. **Professionals** showcase photo portfolios, manage working hours & availability, issue itemized estimates (labour, materials, duration, exclusions), and build reputations backed by verified badges.
3. **Administrators** review verification documents (government ID, business license), moderate flagged reviews, resolve customer complaints, and monitor platform health via an immutable audit log.

---

## 2. Technology Stack & Runtime Architecture

| Layer | Technology | Details |
|---|---|---|
| **Runtime & Language** | Node.js v24 (Native TypeScript) | Fast V8 execution with native type stripping (`--experimental-strip-types`) |
| **Database** | SQLite 3 (`node:sqlite`) & PostgreSQL (`prisma/schema.prisma`) | Embedded WAL SQLite for local/offline dev; normalized schema matching Prisma for PostgreSQL in production |
| **Styling** | Custom Tailwind-Tokenized Modern CSS | Deep Navy Blue (`#0F172A`), Teal/Emerald (`#0D9488`), and Warm White (`#F8FAFC`) |
| **Icons** | Clean Inline SVGs | Fast, accessible, no external web-font dependencies |
| **Security & Auth** | Cryptographic Salts (`scryptSync`) & HMAC-SHA256 | HTTP-only session cookies, strict input validation, least-privilege RBAC |
| **Testing** | Automated Native Test Runner | Comprehensive unit, state machine, and view rendering assertions |

---

## 3. Brand & Design System

- **Primary Color:** Deep Navy Blue (`#0F172A`, `#1E293B`)
- **Secondary Color:** Teal & Emerald (`#0D9488`, `#10B981`)
- **Accent:** Subtle Amber (`#F59E0B`)
- **Background:** Warm White (`#FAFAF9`) & Crisp Slate (`#F8FAFC`)
- **Typography:** Modern readable sans-serif system stack
- **Logo:** Distinctive Workdone wordmark accompanied by the signature House & Tools checkmark symbol

---

## 4. 12 Core Home Service Categories

1. **Carpentry & Furniture:** Custom cabinets, furniture, modular kitchens, doors & windows.
2. **Plumbing Services:** Leak detection, pipe replacement, bathroom fixtures, water heaters.
3. **Electrical Services:** Rewiring, circuit panels, lighting arrays, EV charger installations.
4. **Tile & Flooring Installation:** Porcelain slabs, hardwood, herringbone marble, waterproofing.
5. **Painting & Wall Finishes:** Interior/exterior painting, texture walls, cabinet refinishing.
6. **Interior Design & Decor:** Space planning, 3D renderings, material selection, turnkey execution.
7. **Masonry & Civil Work:** Brickwork, limestone retaining walls, structural repairs, concrete.
8. **AC Installation & Repair:** Heat pumps, ductless mini-splits, seasonal tune-ups, duct cleaning.
9. **Deep Cleaning & Sanitization:** Post-construction deep cleaning, kitchen degreasing, upholstery.
10. **Welding & Metal Fabrication:** Safety gates, custom railings, structural brackets, window grills.
11. **False Ceiling & Gypsum Work:** Designer POP ceilings, acoustic gypsum boards, cove lighting.
12. **General Home Renovation:** Full house remodelling, kitchen & bath overhauls, room additions.

---

## 5. Seeded Demo Accounts

All demo accounts share clean, clearly labelled sample data.

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@workdone.com` | `WorkdoneAdmin2026!` | Access to `/admin` dashboard, verifications, user suspension, and moderation |
| **Customer** | `sarah.jenkins@example.com` | `WorkdoneDemo2026!` | Homeowner in Austin, TX with completed cabinetry job & active EV request |
| **Customer** | `michael.chang@example.com` | `WorkdoneDemo2026!` | Homeowner in Austin, TX with active plumbing job & estimate |
| **Customer** | `priya.patel@example.com` | `WorkdoneDemo2026!` | Homeowner in Seattle, WA with interior design project |
| **Professional** | `marcus.vance@example.com` | `WorkdoneDemo2026!` | Master Carpenter (14 yrs exp, 4.9★, Fully Verified) |
| **Professional** | `david.miller@example.com` | `WorkdoneDemo2026!` | Licensed Master Plumber (12 yrs exp, 4.8★, Fully Verified) |
| **Professional** | `carlos.rodriguez@example.com` | `WorkdoneDemo2026!` | Master Electrician & Smart Home Specialist (9 yrs exp, 4.9★) |
| **Professional** | `elena.rostova@example.com` | `WorkdoneDemo2026!` | Interior Architect & Space Planner (10 yrs exp, 5.0★) |
| **Professional** | `james.oconnor@example.com` | `WorkdoneDemo2026!` | Artisan Tile & Hardwood Craftsman (16 yrs exp, 4.8★) |
| **Professional** | `anita.sharma@example.com` | `WorkdoneDemo2026!` | Surface Restoration Painter (8 yrs exp, 4.7★) |
| **Professional** | `samuel.chen@example.com` | `WorkdoneDemo2026!` | HVAC & Climate Control Specialist (11 yrs exp, 4.8★) |
| **Professional** | `robert.hayes@example.com` | `WorkdoneDemo2026!` | Structural Masonry & Civil Contractor (18 yrs exp, 4.9★) |

---

## 6. Booking & Estimate Lifecycle

```
[Customer Requests Booking]
             │
             ▼
   Status: REQUESTED
             │
   ┌─────────┴───────────────────────┐
   ▼                                 ▼
[Pro Proposes Reschedule]       [Pro Accepts]
   │                                 │
   ▼                                 ▼
Status: RESCHEDULE_PROPOSED     Status: ACCEPTED
   │                                 │
   └─────────► [Customer Confirms] ◄─┘
                     │
                     ▼
             Status: CONFIRMED
                     │
                     ▼
          [Pro Issues Estimate]
   (Labour + Material + Addl + Scope)
                     │
                     ▼
          [Customer Accepts Estimate]
                     │
                     ▼
            Status: IN_PROGRESS
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    [Job Completed]       [Dispute Filed]
         │                       │
         ▼                       ▼
  Status: COMPLETED       Status: DISPUTED
         │                       │
         ▼                       ▼
 [Verified 4-Criteria Review] [Admin Dispute Resolution]
```

---

## 7. Automated Test Suite Results

The automated test runner covers 29 comprehensive assertions:

```
============================================================
       WORKDONE AUTOMATED VERIFICATION & TEST SUITE         
============================================================

[1. Authentication & Role-Based Access Control]
  ✓ Should successfully register a new customer account
  ✓ Should reject registration with invalid email or short password
  ✓ Should successfully register a professional with initial pending verification
  ✓ Should authenticate existing seeded customer and pro accounts
  ✓ Should reject incorrect passwords

[2. Search, Multi-Faceted Filters & Comparison]
  ✓ Should find professionals by trade category
  ✓ Should filter professionals by city locality
  ✓ Should filter professionals by minimum rating
  ✓ Should sort professionals by experience descending

[3. Professional Portfolio & Availability Management]
  ✓ Should allow a professional to add and delete portfolio projects
  ✓ Should reject portfolio deletion from an unauthorized pro
  ✓ Should update professional availability status and working hours

[4. Bookings Lifecycle & State Machine Transitions]
  ✓ Should allow a customer to create a booking request
  ✓ Should enforce state machine transitions: Pro accepts booking
  ✓ Should transition booking to IN_PROGRESS and then to COMPLETED

[5. Estimates & Price Transparency]
  ✓ Should allow professional to create itemized estimate and customer to accept it

[6. Verified Reviews & Rating Enforcement]
  ✓ Should allow eligible customer to submit review on COMPLETED booking
  ✓ Should prevent duplicate review for the same booking

[7. Customer Complaints & Disputes]
  ✓ Should allow customer to submit a formal complaint against a booking

[8. Administrator Controls, Verifications & Moderation]
  ✓ Should return comprehensive admin metrics
  ✓ Should allow admin to review and approve verification records
  ✓ Should allow admin to toggle user active/suspended status

[9. Frontend Views & UI Component Rendering]
  ✓ Should render Homepage with all required sections
  ✓ Should render Find Professionals Search view with active filters and cards
  ✓ Should render Public Professional Profile with portfolio and reviews
  ✓ Should render Side-by-Side Professional Comparison Matrix
  ✓ Should render Customer Dashboard tabs and booking records
  ✓ Should render Professional Dashboard with completion checklist and jobs
  ✓ Should render Super Admin Dashboard with metrics and moderation queue

============================================================
TOTAL TESTS: 29 | PASSED: 29 | FAILED: 0
============================================================
```

---

## 8. Setup & Development Instructions

### Running in this environment
```powershell
# Navigate to the project directory
cd "C:\Users\DELL\.gemini\antigravity\scratch\workdone"

# Seed the database
agy-node --experimental-strip-types src/db/seed.ts

# Run the automated test suite
agy-node --experimental-strip-types src/tests/runTests.ts

# Start the application server
agy-node --experimental-strip-types src/server.ts
```

Open `http://localhost:3000` in your web browser.

### Production Deployment with PostgreSQL & Prisma
1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your production PostgreSQL connection string.
2. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Set your production `SESSION_SECRET` (at least 32 random characters).
4. Start the server behind a reverse proxy (e.g., Nginx, Caddy, or Cloudflare).
