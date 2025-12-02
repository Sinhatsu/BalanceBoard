# 💰 BalanceBoard - Smart Expense Tracker

<div align="center">
  
  ![BalanceBoard Banner](./public/balanceboard-banner.png)
  
  **A modern, AI-powered personal finance tracker that helps you manage income, expenses, and budgets effortlessly.**

</div>

---

## ✨ Features

### 🧾 **Smart Receipt Scanning**

- Upload receipt images and extract transaction details automatically using AI (Google Gemini)
- Auto-categorization based on merchant and purchase type
- Edit and confirm details before saving

### 💳 **Multi-Account Management**

- Create multiple accounts (Savings, Current)
- Track balance across different accounts
- Set a default account for quick transactions
- Instant balance updates whenever you add, edit, delete, or import transactions (no bank sync)

### 📊 **Advanced Analytics & Charts**

- Visual breakdown of income vs expenses
- Category-wise spending analysis with pie charts
- Monthly trend analysis with interactive line charts
- Account-specific transaction history and charts

### 🔄 **Recurring Transactions**

- Set up recurring income or expenses (Daily, Weekly, Monthly, Yearly)
- Automatic processing via background jobs (Inngest)
- Skip or modify individual occurrences

### 🎯 **Budget Management**

- Set overall monthly budgets
- Track spending progress with visual indicators
- Budget alerts via email when thresholds are reached
- Per-category budget tracking with progress bars

### 💡 **AI-Powered Insights**

- Smart spending pattern analysis
- Personalized recommendations to optimize finances
- Anomaly detection for unusual expenses

### 📥 **Import/Export**

- Export all transactions to CSV for backup
- Import transactions from CSV files
- Bulk transaction management

### 🔐 **Secure Authentication**

- Clerk authentication with email/password
- OAuth support (Google, GitHub)
- Rate limiting with ArcJet to prevent abuse

### 🌓 **Modern UI/UX**

- Dark/Light mode support
- Responsive design for mobile, tablet, and desktop
- Beautiful charts with Recharts
- Smooth animations and transitions

---

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15** (App Router, Server Components, Server Actions)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **Recharts** for data visualization
- **Lucide React** for icons

### **Backend**

- **Next.js API Routes** & **Server Actions**
- **Prisma** ORM with PostgreSQL
- **Clerk** for authentication
- **Google Gemini AI** for receipt OCR
- **Inngest** for background jobs (recurring transactions)
- **Resend** for email notifications

### **DevOps & Tools**

- **Vercel** for deployment
- **ArcJet** for rate limiting
- **Zod** for schema validation
- **React Hook Form** for form management

---

## 🚀 What BalanceBoard Does (And Why)

BalanceBoard is a **personal finance command center**:

- Tracks **income, expenses, and balances** across multiple accounts.
- Lets you **scan receipts with AI**, or add / import transactions manually.
- Gives you **time-based charts, category breakdowns, and AI insights** so you actually understand your spending.
- Adds **budgets and category budgets** so you can control where money goes instead of just recording it.

The goal is to go beyond a tutorial app and feel like a **real product**: fast, reliable, and clear enough that you’d trust it with your own money data.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- PostgreSQL database (or use a service like Neon, Supabase, or PlanetScale)
- Clerk account for authentication
- Google AI API key (Gemini)
- Resend API key for emails

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sinhatsu/BalanceBoard.git
   cd BalanceBoard
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/balanceboard"
   DIRECT_URL="postgresql://user:password@localhost:5432/balanceboard"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Resend (Email)
   RESEND_API_KEY=your_resend_api_key

   # Inngest (Background Jobs)
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key

   # ArcJet (Rate Limiting)
   ARCJET_KEY=your_arcjet_key
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed with sample data
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🧱 Architecture Overview

At a high level:

- **Next.js App Router** handles routing, layouts, and streaming with `page.tsx` + `loading.tsx` pairs.
- **Server Actions** (in `actions/`) encapsulate all writes: creating transactions, accounts, budgets, CSV import/export, AI insights, etc.
- **Prisma + PostgreSQL** provide a relational data model:
  - `User` → `Account` → `Transaction`
  - `Budget` and `CategoryBudget` for global + per-category limits
- **Clerk** injects the authenticated user into server actions (`auth()`), so **every query is scoped to the current user**.
- **Google Gemini** is called from server actions (`actions/transaction.ts`, `actions/insights.ts`) so keys never touch the browser.
- **Inngest** is wired for recurring transactions and future background jobs.
- **ArcJet** protects server actions from abuse via rate limiting.

On the client:

- **React Hook Form + Zod** manage validation for transaction/account forms.
- **shadcn/ui + Tailwind** provide a design system for consistent buttons, cards, dialogs, selects, etc.
- **Recharts** renders charts on the dashboard.
- **Next Themes** (`ThemeProvider`, `ThemeToggle`) control light/dark + the neutral/green palette.

---

## 📂 Project Structure

```
BalanceBoard/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (main)/              # Main app pages (dashboard, accounts, transactions)
│   ├── api/                 # API routes
│   └── lib/                 # App-specific utilities
├── actions/                 # Server actions (transaction, account, budget, etc.)
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Feature components
├── data/                    # Static data (categories, landing page content)
├── emails/                  # Email templates
├── hooks/                   # Custom React hooks
├── lib/                     # Shared utilities and configs
│   ├── inngest/             # Background job definitions
│   ├── prisma.ts            # Prisma client
│   └── ...
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
└── ...
```

---

## 🧭 Key UX & Behavior Details

- **Loading experience**

  - `loading.tsx` files for dashboard, account page, and transaction create page show **skeleton UIs** instead of blank screens.
  - A shared `LoadingSpinner` component is used where inline loading is needed (buttons, overlays, etc.).

- **Accounts & balances**

  - Every transaction is tied to a specific **account** and **user**.
  - Creating/updating/deleting transactions **adjusts the account’s balance** inside a Prisma transaction so things don’t drift.
  - You can **set a default account**, and you can **delete accounts**:
    - You must always have at least one account.
    - You can’t delete the default account until another is set as default.
    - Deleting an account also deletes its transactions.

- **Budgets & category budgets**

  - A global budget tracks total monthly spend vs limit.
  - Category budgets track spending vs limit per category, with a progress view on the dashboard.

- **CSV export/import**

  - Export produces a clean CSV of transactions (with account name, category, recurring info, status).
  - Import parses + validates CSV on the server, shows a preview and errors, then:
    - Lets you choose **which account to import into**.
    - Creates transactions and updates that account’s balance accordingly.

- **AI features**
  - **Receipt scanning**: extract amount, date, description, and category from receipt images.
  - **Spending insights**: Gemini-powered analysis of the last few months, with a safe fallback to basic analytics if the AI API is down.

---

## 🎨 Screenshots

### Dashboard

![Dashboard](./public/dashboard.png)

### Transaction Management

![Transactions](./public/transaction.png)

### Receipt Scanner

![Receipt Scanner](./public/receipt.png)

### Analytics

![Analytics](./public/analytics.png)

---

## 🧪 Usage

### Creating Your First Account

1. Sign up / Sign in
2. Click "Add New Account" on the dashboard
3. Enter account name, type (Savings/Current), and initial balance
4. Set as default if desired

### Adding Transactions

1. Navigate to "Add Transaction"
2. **Option 1**: Upload a receipt image → AI extracts details → Review & confirm
3. **Option 2**: Manually enter amount, category, description, date
4. Toggle "Recurring" if it's a repeating transaction
5. Select the account to deduct/add funds

### Setting Up Budgets

1. Go to Dashboard
2. Click "Set Budget"
3. Enter your monthly budget limit
4. Track progress with the visual indicator
5. Receive email alerts when you exceed 80% of your budget

### Exporting Data

1. Go to Accounts or Dashboard
2. Click "Export" button
3. Download CSV file with all transactions

---

## 🔮 Roadmap

- [x] Receipt scanning with AI
- [x] Multi-account support
- [x] Recurring transactions
- [x] Budget tracking
- [x] **Per-category budgets**
- [x] **AI spending insights and recommendations**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Piyush**

- GitHub: [@Sinhatsu](https://github.com/Sinhatsu)

---

## 📞 Support

If you found this project helpful, please give it a ⭐️!

For questions or support, please open an issue on GitHub.

---

<div align="center">
  Made with ❤️ by Piyush
</div>
