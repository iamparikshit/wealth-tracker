# Expense & Asset Tracker - Complete Documentation

## Project Overview

A comprehensive personal finance management application built with React, TypeScript, and Supabase. Track expenses, assets (bank accounts, FDs, RDs, Mutual Funds, Gold), and view detailed analytics with a beautiful mobile-first UI.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend Framework** | React 18 with TypeScript |
| **Build Tool** | Vite 5.x |
| **Styling** | Tailwind CSS 3.x |
| **Icons** | Lucide React |
| **Backend & Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email/Password) |
| **Hosting (Recommended)** | Vercel / Netlify / Cloudflare Pages |
| **Database Hosting** | Supabase Cloud (Free Tier) |

---

## Database Schema

### Tables

#### 1. `expenses`
Track daily expenses with categories and payment methods.

```sql
expenses (
  id              uuid PRIMARY KEY
  user_id         uuid REFERENCES auth.users
  amount          numeric(14,2) NOT NULL
  category        text NOT NULL  -- food, transport, shopping, etc.
  description     text DEFAULT ''
  date            date NOT NULL
  payment_source  text DEFAULT 'cash'  -- upi, credit_card, debit_card, cash, etc.
  bank_account    text DEFAULT ''       -- HDFC, SBI, ICICI, etc.
  created_at      timestamptz DEFAULT now()
)
```

#### 2. `assets`
Track all your financial assets (bank accounts, investments).

```sql
assets (
  id           uuid PRIMARY KEY
  user_id      uuid REFERENCES auth.users
  name         text NOT NULL
  type         text NOT NULL  -- bank, fd, rd, mutual_fund, gold, etc.
  value        numeric(14,2) NOT NULL
  institution  text DEFAULT ''
  notes        text DEFAULT ''
  created_at   timestamptz DEFAULT now()
  updated_at   timestamptz DEFAULT now()
)
```

#### 3. `asset_transactions`
Track deposits, withdrawals, and transactions for each asset.

```sql
asset_transactions (
  id               uuid PRIMARY KEY
  asset_id         uuid REFERENCES assets ON DELETE CASCADE
  user_id          uuid REFERENCES auth.users
  amount           numeric(14,2) NOT NULL
  date             date NOT NULL
  transaction_type text NOT NULL  -- deposit, withdrawal, interest, sip, etc.
  notes            text DEFAULT ''
  created_at       timestamptz DEFAULT now()
)
```

#### 4. `budgets`
Set monthly spending limits per category.

```sql
budgets (
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES auth.users
  category      text NOT NULL
  monthly_limit numeric(14,2) NOT NULL
)
```

### Row Level Security (RLS)

All tables have RLS enabled with restrictive policies:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Similar policies for INSERT, UPDATE, DELETE on all tables
```

---

## Features

### Expense Management
- Add expenses with amount, category, description, date
- **Payment source tracking**: UPI, Credit Card, Debit Card, Cash, Net Banking, Wallet, Cheque
- **Bank account tracking**: Know exactly which bank/account was used
- 10 expense categories with icons
- Edit and delete expenses
- Search and filter by category

### Calendar View
- Monthly calendar with daily expense totals
- Heat-map visualization (greener = higher spending)
- Tap any day to see all transactions
- Monthly summary (total, daily average, active days)

### Asset Portfolio
- Track multiple asset types:
  - Bank Accounts (savings, current)
  - Fixed Deposits (FD)
  - Recurring Deposits (RD)
  - Mutual Funds (SIP tracking)
  - Gold (physical & digital)
  - Cryptocurrency
  - Property
  - Vehicles
  - Other assets
- Transaction history per asset
- Auto-update asset value on transactions
- Portfolio breakdown by type with percentages

### Analytics
- Category-wise spending breakdown
- Current vs previous month comparison
- Budget progress tracking
- Payment method analytics

### Export
- Export expenses to CSV
- Export to Google Sheets (via Edge Function)
- Filter by date range

---

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── AddExpense.tsx        # Add expense form
│   │   ├── EditExpense.tsx       # Edit/delete expense modal
│   │   ├── ExpenseList.tsx       # List with search/filter
│   │   ├── Calendar.tsx          # Calendar view
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Assets.tsx            # Asset list view
│   │   ├── AssetDetail.tsx       # Asset detail & transactions
│   │   ├── Analytics.tsx         # Charts & stats
│   │   ├── Export.tsx            # Export options
│   │   ├── Auth.tsx              # Login/signup
│   │   └── BottomNav.tsx         # Navigation bar
│   ├── hooks/
│   │   ├── useAuth.ts            # Authentication logic
│   │   ├── useExpenses.ts        # Expense operations
│   │   └── useAssets.ts          # Asset operations
│   ├── lib/
│   │   └── supabase.ts           # Supabase client
│   ├── constants.ts              # Categories, types, icons
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Helper functions
│   └── App.tsx                   # Main app component
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_asset_transactions.sql
│   │   └── 003_expense_payment_source.sql
│   └── functions/
│       └── google-sheets-export/ # Export to Google Sheets
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
└── package.json
```

---

## Local Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup Steps

1. **Clone the project**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**

   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## Setting Up Supabase (Database)

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a **FREE** account
3. Free tier includes:
   - 500 MB database
   - 1 GB file storage
   - 50,000 monthly active users
   - 5 GB bandwidth

### Step 2: Create New Project

1. Click "New Project"
2. Enter project name: `expense-tracker`
3. Set a strong database password (save it!)
4. Choose region closest to you (e.g., Singapore for India)
5. Click "Create new project" (takes ~2 minutes)

### Step 3: Get API Keys

1. Go to **Project Settings** (gear icon)
2. Click **API** in sidebar
3. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Step 4: Run Migrations

The migrations are already applied via the development environment. For a fresh Supabase project, you need to run them manually:

**Option A: Using Supabase Dashboard**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy content from each migration file
3. Execute in order: 001, 002, 003

**Option B: Using Supabase CLI** (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref <your-project-id>

# Push migrations
supabase db push
```

### Step 5: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Turn OFF "Enable email confirmations"

---

## Free Hosting Options

### Option 1: Vercel (Recommended)

**Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Custom domains

**Deployment Steps:**

1. Push code to GitHub

2. Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. Click "New Project"
   - Import your repository
   - Framework Preset: **Vite**
   - Root Directory: `./`

4. Add Environment Variables:
   ```
   VITE_SUPABASE_URL = your_url
   VITE_SUPABASE_ANON_KEY = your_key
   ```

5. Click "Deploy"

6. Your app will be live at: `your-project.vercel.app`

**Auto-Deploy:** Every push to main branch auto-deploys

---

### Option 2: Netlify

**Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Custom domains

**Deployment Steps:**

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import existing project"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables (same as Vercel)
7. Click "Deploy site"

---

### Option 3: Cloudflare Pages

**Free Tier:**
- Unlimited bandwidth
- Unlimited requests
- Global CDN

**Deployment Steps:**

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub
3. Select repository
4. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
5. Add environment variables
6. Deploy

---

### Option 4: GitHub Pages (Static Only)

**Note:** Works but requires manual deployment

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

**Limitation:** Environment variables must be hardcoded (not secure for API keys)

---

## Recommended Free Stack

```
┌─────────────────────────────────────────────┐
│            YOUR COMPLETE SETUP              │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend Hosting: Vercel (FREE)            │
│  ├── https://your-app.vercel.app           │
│  ├── Auto SSL certificate                  │
│  ├── Global CDN                            │
│  └── Auto-deploy on git push               │
│                                             │
│  Backend & Database: Supabase (FREE)       │
│  ├── PostgreSQL Database                   │
│  ├── Authentication                        │
│  ├── Row Level Security                    │
│  ├── Real-time subscriptions               │
│  └── Edge Functions                        │
│                                             │
│  Total Cost: $0/month                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Production Checklist

### Before Deploying

- [ ] Update `.env` with production Supabase keys
- [ ] Enable RLS on all tables (already done)
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Check mobile responsiveness
- [ ] Run `npm run build` to verify no errors

### After Deploying

- [ ] Test deployed app thoroughly
- [ ] Set up custom domain (optional)
- [ ] Enable Supabase logs for monitoring
- [ ] Set up database backups (Supabase does this automatically)
- [ ] Monitor usage in Supabase dashboard

---

## Custom Domain Setup

### On Vercel

1. Go to your project dashboard
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `expenses.yourdomain.com`)
4. Update DNS records as instructed:
   - Add A record
   - Add CNAME record
5. Wait for SSL certificate (automatic)

### On Netlify

1. Go to **Domain settings**
2. Add custom domain
3. Update DNS with your registrar
4. SSL is automatic

---

## Security Best Practices

### Already Implemented

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - All tables protected with policies

2. **Authentication**
   - Password hashing by Supabase
   - Secure session management

3. **API Keys**
   - Only `anon` key is public (safe for frontend)
   - `service_role` key never exposed

4. **HTTPS**
   - All hosting platforms provide SSL

### Additional Recommendations

1. **Enable Rate Limiting** (Supabase Pro only)
   - Prevents abuse

2. **Set Up Monitoring**
   - Use Supabase logs
   - Set up error tracking (Sentry, etc.)

3. **Regular Backups**
   - Supabase provides daily backups (free tier)

---

## Troubleshooting

### Common Issues

**1. "Failed to fetch" errors**
- Check Supabase URL and anon key
- Verify internet connection
- Check Supabase status page

**2. Authentication not working**
- Check if email confirmation is disabled
- Verify auth settings in Supabase dashboard

**3. Build fails on deployment**
- Check build logs
- Run `npm run build` locally first
- Verify all dependencies are in package.json

**4. RLS blocking data access**
- Verify user is authenticated
- Check RLS policies in Supabase SQL editor
- Test with Supabase dashboard's table editor

**5. Environment variables not working**
- Restart dev server after changing .env
- On Vercel/Netlify, add in dashboard, not .env file
- Prefix with `VITE_` for Vite to recognize

---

## API Reference

### Supabase Client

```typescript
import { supabase } from './lib/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign up
await supabase.auth.signUp({ email, password });

// Sign out
await supabase.auth.signOut();

// Query expenses
const { data, error } = await supabase
  .from('expenses')
  .select('*')
  .order('date', { ascending: false });
```

### React Hooks

```typescript
// useExpenses hook
const {
  expenses,          // Expense[]
  addExpense,        // (expense) => Promise<Expense>
  updateExpense,     // (id, updates) => Promise<Expense>
  deleteExpense,     // (id) => Promise<void>
  getMonthExpenses,  // (year, month) => Expense[]
} = useExpenses(userId);

// useAssets hook
const {
  assets,             // Asset[]
  transactions,       // AssetTransaction[]
  addAsset,           // (asset) => Promise<Asset>
  updateAsset,        // (id, updates) => Promise<Asset>
  deleteAsset,        // (id) => Promise<void>
  addTransaction,     // (transaction) => Promise<AssetTransaction>
  getTotalValue,      // () => number
} = useAssets(userId);
```

---

## Future Enhancements

Potential features to add:

- [ ] Recurring expenses (subscriptions)
- [ ] Bill reminders
- [ ] Multi-currency support
- [ ] Receipt photo upload
- [ ] Export to PDF
- [ ] Family/shared accounts
- [ ] Budget vs Actual charts
- [ ] Investment portfolio analytics
- [ ] Stock/MF NAV integration
- [ ] WhatsApp bot for quick expense entry
- [ ] Dark/Light theme toggle

---

## Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

## License

MIT License - Feel free to use, modify, and distribute.

---

**Built with ❤️ using React, TypeScript, Supabase, and Tailwind CSS**
