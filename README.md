# Smile & Dental Clinic — Production Website & PWA 🦷

Modern, mobile-first dental healthcare website and Progressive Web App (PWA) for **Smile & Dental Clinic**, led by **Dr. Ananyo Mandal**, MDS (WBUHS, CAL), Dept. of Conservative Dentistry & Endodontics, Cosmetic Dental Surgeon.

Built with **Google Stitch**, **React + Vite**, **Tailwind CSS**, **Supabase** (PostgreSQL + Realtime), and **Firebase Cloud Messaging (FCM)** for system-level web push notifications.

---

## 🌟 Features

* **Exact-Time Appointment Requests:** No 30-minute rigid slot rounding. Patients select their preferred exact time (e.g. 11:17 AM) within morning (10:30 AM – 2:00 PM) or evening (5:00 PM – 9:00 PM) clinic hours.
* **Open 7 Days a Week:** Clinic operates daily with morning and evening sessions and zero weekly off days.
* **Realtime Push Notifications (FCM):**
  * Patient receives system push alerts when their appointment is Accepted, Rescheduled, or Completed.
  * Doctor receives instant push notifications on **all active registered devices** (smartphones, laptops, tablets) when a new appointment is booked.
* **Patient Privacy & Identity:** Isolated tracking tokens ensure patients only access their own records and notification history.
* **Doctor Admin Portal:**
  * Realtime appointments dashboard with instant updates via Supabase Realtime.
  * Conflict warning indicators for overlapping time requests.
  * Patient contact triggers (direct call & WhatsApp).
  * Treatment catalog manager (add/edit English & Bengali names and descriptions).
  * Multi-device push monitor and instant push testing tool.
* **Bilingual Clinical Catalog:** All 12 procedures featured with English & Bengali titles, detailed descriptions, and high-resolution educational infographic posters.
* **Installable PWA:** Full offline caching, custom app icons, and background push support via service worker.
* **Local & Technical SEO:** JSON-LD schema for Dentist/LocalBusiness/Doctor, dynamic meta tags, OpenGraph, sitemap.xml, and robots.txt.

---

## 🏥 Clinic & Contact Details

* **Doctor:** Dr. Ananyo Mandal, MDS (WBUHS, CAL)
* **Designation:** Cosmetic Dental Surgeon & Endodontist
* **Address:** Opposite INOX, Beside WOW MOMO, Beside SBI ATM, Burdwan 713101, West Bengal
* **Google Maps:** [https://maps.app.goo.gl/DaxAQyaVuSHSXSck9](https://maps.app.goo.gl/DaxAQyaVuSHSXSck9)
* **Primary Phone (Call & WhatsApp):** 9903424407
* **Additional Contact Lines:** 6297190906 • 9732085852
* **Email:** mandalananyo@gmail.com
* **Operating Hours:** 10:30 AM – 2:00 PM & 5:00 PM – 9:00 PM (Daily)

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti
* **Design System:** Google Stitch ("Clinical Clarity" aesthetic)
* **Backend Database:** Supabase (PostgreSQL, Row-Level Security, Realtime Pub/Sub)
* **Push Notifications:** Firebase Cloud Messaging (Web Push VAPID + Firebase Admin SDK)
* **Server:** Node.js Express API proxy & FCM dispatcher

---

## 🚀 Getting Started

### 1. Clone repository & Install Dependencies
```bash
git clone https://github.com/hiswaruppal1916-swarup/smileanddentalclinic.git
cd smileanddentalclinic
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase and Firebase keys:
```bash
cp .env.example .env
```
Ensure your `serviceAccountKey.json` is placed in the project root for Firebase Admin push dispatching.

### 3. Run Development Server
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **API & FCM Server:** `http://localhost:3000`

---

## 🔒 Security & Privacy
Private credentials including `serviceAccountKey.json` and `.env` are strictly protected by `.gitignore` and never committed to source control.
