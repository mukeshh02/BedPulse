# 🏥 BedPulse™ — Smart Hospital Inpatient & Ward Care OS

> **A Product by WebVission**  
> 📞 Support Helpline: **+91 7000371321**  
> 🌐 Tech Stack: **Next.js 14 (App Router) + Supabase (PostgreSQL) + Tailwind CSS + Lucide Icons**

---

## 🌟 Overview & Core Clinical Flow

BedPulse™ is an ultra-clean, high-efficiency Hospital Inpatient & Bed Management Operating System designed with a **"More Icons, Less Text"** clinical philosophy and strictly following modern healthcare UI/UX standards (MediPlus & Behance aesthetic).

### The 4 Core Clinical Workflows:
1. **Step 1 & 2 — Patient Admission & Bed Allocation:**
   - Quick patient demographic intake (Name, Age, Gender, Mobile, Attendant, Doctor, Provisional Diagnosis).
   - Real-time interactive bed selector displaying only currently vacant beds in the chosen ward.
2. **Step 3 — Bed Transfers / Shifts in Ward:**
   - Select admitted patient, pick destination ward and vacant bed, record clinical transfer reasons with full audit trail.
   - Automatically moves previous bed to "Under Sanitization / Cleaning" and target bed to "Occupied".
3. **Step 4 — Patient Discharge & Referrals:**
   - Support for **Normal Discharge** (summary, doctor advice, follow-up date), **Refer to Higher Center** (hospital name, reason), and **LAMA Exit**.
   - Auto-frees the bed and generates a printable clinical discharge slip.
4. **Dynamic Ward & Bed Master Studio (Settings):**
   - No hardcoded bed limits! Hospital administrators can dynamically add/configure wards and add beds with custom room types and daily rates.

---

## 🚀 Quick Start (Local Development)

### 1. Install & Run
```bash
# Dependencies are already installed
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> **Note:** The application includes a smart local-first reactive repository. It runs 100% interactively out of the box even before connecting to Supabase!

---

## 🗄️ Supabase Database Setup

1. Open your project on [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) and click **Run**.
4. This will create:
   - `wards` table
   - `beds` table
   - `patients` table
   - `admissions` table
   - `bed_transfers` table
   - `discharges` table
   - Pre-seeds the hospital with initial wards (ICU, FGW, MGW, Private, Deluxe, Pre-op) and 33 beds.
5. In your project root, create `.env.local` and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

---

## ☁️ Deployment (GitHub + Vercel)

### Push to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Deploy on Vercel:
1. Login to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Your hospital system will be live globally in under 60 seconds!

---

## 📞 Support & Customization
Developed by **WebVission**  
Helpline: **+91 7000371321**
