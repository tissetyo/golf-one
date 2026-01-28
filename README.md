# Golf Tourism Platform ⛳🏨🚗

A premium, full-stack Golf Tourism Platform built with **Next.js 16**, **Supabase**, **Xendit**, and **Google Gemini AI**.

## 🌟 Key Features

- **AI-Powered Conversational Booking**: Plan your entire trip by chatting with our Gemini AI agent.
- **Multi-Vendor Ecosystem**: Unified booking flow for Golf Courses, Hotels, and Travel Packages.
- **Offline-First PWA**: Track your golf scores even without an internet connection; syncs automatically when online.
- **Role-Based Dashboards**:
  - **Admin**: Revenue analytics, user management, and manual split-settlement tracking.
  - **Golf Vendor**: Tee time management, caddie logs, and real-time score viewing.
  - **Hotel Vendor**: Room inventory and availability management.
  - **Travel Vendor**: Package and fleet operations.
- **Secure Payments**: Integrated with Xendit for Invoices (VA, QRIS, e-Wallets).

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server Actions & API Routes (Edge-ready).
- **Database/Auth**: Supabase (PostgreSQL, RLS, Auth).
- **AI**: Google Generative AI (Gemini 1.5 Flash).
- **Payments**: Xendit Node SDK.
- **PWA**: `@ducanh2912/next-pwa`.

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- Supabase Project
- Xendit Account (Sandbox)
- Google AI Studio API Key

### 2. Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Xendit
XENDIT_SECRET_KEY=xnd_...
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_...
XENDIT_WEBHOOK_TOKEN=your_callback_token

# Google Gemini AI
GEMINI_API_KEY=your_gemini_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the migrations provided in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📈 Platform Workflow

1. **Discovery**: User chats with AI to find courses, hotels, and travel options.
2. **Booking**: AI help user select specific items; a booking is created in `pending_approval` status.
3. **Approval**: Respective vendors log in to their dashboards to approve the request.
4. **Payment**: Once all vendors approve, user pays via Xendit invoice.
5. **Confirmation**: Webhook notifies the system, updating booking to `paid`.
6. **Settlement**: Admin manually forwards the funds to vendors (tracked in Admin Dashboard).

## 📱 Mobile App (PWA)

To install as an app:
1. Open the URL on a mobile browser.
2. Select "Add to Home Screen".
3. Enjoy offline-first score tracking at the course!

---

Developed with ❤️ for Golf Enthusiasts.
