# 🏌️‍♂️ Golf Tourism Platform (AI-Powered)

A premium, full-stack Golf Tourism platform built with **Next.js 16**, **Supabase**, and **Google Gemini AI**. Designed to provide a seamless booking experience for golfers while offering robust management tools for courses, hotels, and travel vendors.

## ✨ Features

### 🌈 User Experience
*   **High-Impact Light Mode**: A clean, premium emerald-themed UI designed for clarity and elegance.
*   **Card-Based Discovery**: Navigate through large, interactive category cards for Golf, Hotels, and Travel.
*   **AI Concierge**: A full-screen AI assistant that can plan and book your entire trip conversationally using Gemini 1.5 Flash.
*   **Manual Trip Builder**: Persistent "Trip Summary" bar allows users to select items across categories and review them in a unified checkout.

### 🏨 Vendor & Admin Ecosystem (7 Dashboards)
*   **Golf Vendor**: Manage tee times, caddies, and view real-time player scores.
*   **Hotel Vendor**: Room inventory management and booking approvals.
*   **Travel Vendor**: Logistics hub for airport transfers and day tours.
*   **Admin Hub**: Central management of system architecture, user roles, and manual split-settlement logs.

### 🏧 Payment & Security
*   **Xendit Integration**: Production-ready payment flow (VA, QRIS, eWallet).
*   **Unified Checkout**: Single-point review for multi-item bookings.
*   **Role-Based Access**: Secure Supabase RLS and Next.js Middleware protection for all roles.

### 📱 PWA & Offline
*   **Offline Score Tracking**: Sync scores to the clubhouse even without a connection using Service Workers and Background Sync.

## 🛠️ Tech Stack
*   **Frontend**: Next.js 16 (App Router), Tailwind CSS, Lucide Icons.
*   **Backend**: Supabase (Database, Auth, RLS).
*   **AI**: Google Generative AI (Gemini 1.5 Flash).
*   **Payments**: Xendit Node SDK.
*   **Cloud**: Vercel.

## 🚀 Getting Started

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/your-username/golf-one.git
    cd golf-one
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env.local` with your credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    GEMINI_API_KEY=...
    XENDIT_SECRET_KEY=...
    ```

3.  **Run Development**:
    ```bash
    npm run dev
    ```

4.  **Seed Data**:
    Run the seeder to populate courses and hotels:
    ```bash
    npx tsx scripts/seed-full-data.ts
    ```

## 📜 License
Privately owned by the Golf Tourism Platform team.

---
*Created with ❤️ by Antigravity*
