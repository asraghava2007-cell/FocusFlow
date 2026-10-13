# FocusFlow — Midnight Focus

> Minimalist screen-time management and rhythmic focus dashboard inspired by Linear and Raycast.

FocusFlow is a production-grade, privacy-first productivity web application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Designed with the **Midnight Focus** aesthetic, it provides deep charcoal surfaces, soft lavender accents, hairline borders, and zero-distraction telemetry.

---

## ✨ Features

- **Drift-Proof Pomodoro Timer:**
  - Wall-clock timestamp delta calculations (`targetEndTime - Date.now()`) to prevent timer drift from browser throttling and background tab suspension.
  - Automatic session progression: Focus (25m) → Short Break (5m) → Long Break (15m) every 4 sessions (customizable).
  - Smooth animated circular SVG dial with color-coded modes and session dot progression.
  - Native Web Audio API sound synthesis (Zen singing bowl, soft bell, warm marimba, modern pip) with zero external media files.
  - Desktop browser notification alerts with user permission toggle.
  - Direct task anchoring (bind active Pomodoro intervals to discrete tasks).

- **Screen Time & Activity Breakdown:**
  - Categorized breakdown across *Coding, Study, Entertainment, Social Media, and Other*.
  - Timeline bar charts and category distribution with Recharts.
  - Intentional manual logging modal with quick-duration pills.
  - Filters for Today, Last 7 Days, and Last 30 Days.
  - Privacy-first transparency: 100% in-browser without background spyware or invasive monitoring software.

- **Tasks & Objectives:**
  - Tidy task management with priority levels (*Low, Medium, High*).
  - Estimated vs. actual focused duration tracking.
  - One-click "Focus" button that immediately loads the task into the active Pomodoro countdown.

- **Habit Tracking & Daily Intentions:**
  - Daily deep work focus target and screen-time allowance sliders.
  - Consistency streak counter tracking consecutive active days and personal records.
  - Daily intentions checklist with check-off states.
  - Positive, non-judgmental messaging designed to support healthy digital habits.

- **Analytics:**
  - Focus time vs. screen time trend area charts.
  - Category distribution donut charts.
  - Empirical KPIs: Top productive day, average session duration, and goal completion rate.

- **Settings & Data Portability:**
  - Interface themes: **Midnight Focus** (Dark Charcoal `#111318`) and **Crisp Light Mode**.
  - LocalStorage persistence across refreshes and browser restarts.
  - Full data export: Download telemetry anytime as **JSON backup** or **CSV spreadsheet**.
  - Complete data wipe / reset with confirmation dialog.

---

## 🛠 Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Midnight Focus theme tokens)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Audio:** Native Web Audio API
- **Celebration Effects:** Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/focusflow.git
   cd focusflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🔒 Privacy & Architecture

FocusFlow operates **100% locally in your browser**:
- **No analytics tracking or trackers.**
- **No telemetry sent to third-party servers.**
- **No backend database requirements.**
- All session records, task lists, and timer preferences are stored securely in the browser's `localStorage`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
