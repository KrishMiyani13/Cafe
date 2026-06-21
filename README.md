# 🧾 TableBite: Smart QR Ordering & Diners Platform

TableBite is a premium, real-time QR code ordering and restaurant management platform. It allows diners to scan a table-specific QR code, review the localized menu (English, Hindi, Gujarati), place orders, call for service, and settle their final consolidated bill. 

For staff and managers, it provides a real-time command dashboard containing an order queue (Kitchen Display System), waiter service calls, menu customizers, table QR code generators, and customer reviews.

---

## ✨ Features

### 🍽️ Customer Menu Portal
* **Real-time Order Stepper:** Tracks food status live from ordered $\rightarrow$ preparing $\rightarrow$ served.
* **Unified Table Billing:** Consolidates multiple repeat orders into a single, unified bill. Diners can check out once for the entire table.
* **Three-way Payment Choices:**
  * **Instant UPI:** Automatically renders a scan-to-pay QR code populated with the exact bill total.
  * **Credit/Debit Card:** Displays checkout instructions using physical card (POS) machines.
  * **Cash:** Settle cash directly with waitstaff or at the cash counter.
* **SaaS Multi-Language Toggle:** Instantly translate the menu interface into English, Hindi, or Gujarati.
* **Waiter Alerts Panel:** One-click shortcuts for diners to call for general assistance, ask for water, or request the bill.

### 💼 Manager & Staff Dashboard
* **Role-Based Pipelines:** Dedicated workflows for managers, chefs (Kitchen Display view), and waitstaff (alert logs).
* **Live Orders Queue:** Sound-notified kitchen pipelines with real-time status controllers (Prepare, Serve, Settle).
* **Visual Theme customizer:** Live theme color customization (Sunset Bistro, Emerald Garden, Neon Lounge, Warm Mocha).
* **Menu Editor:** Instantly add, edit, toggle availability, or delete categories and menu items.
* **Table QR Generator:** Generate table-specific QR ordering links and codes.
* **Reviews Log:** Collect and view customer star ratings and comment loops.

---

## 🛠️ Technology Stack

1. **Frontend:** React, TypeScript, Vanilla CSS (Premium glassmorphic styling), and Lucide React Icons.
2. **Backend & Cloud Sync:** Supabase (PostgreSQL with Postgres Realtime replication listeners).
3. **Offline Fallback Engine:** Gracefully falls back to localized HTML5 `localStorage` with window storage event listeners to sync updates across mock tabs if Supabase environment keys are missing.
4. **Build System:** Vite.

---

## 🚀 Getting Started (Local Run)

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation
1. Clone the project repository and open it in a terminal.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Access the portal at **[http://localhost:5173/](http://localhost:5173/)** (Landing page/Dashboard) or directly test table ordering at **[http://localhost:5173/#/cafe/unwind-cafe/table/1](http://localhost:5173/#/cafe/unwind-cafe/table/1)**.

---

## ☁️ Connecting Supabase Cloud Database

To enable live cross-device ordering and database synchronization:

### 1. Set Up Database Schema
Log into your [Supabase Console](https://supabase.com/), create a new project, navigate to the **SQL Editor**, and run the following migrations script:

```sql
-- 1. Create Cafes Table
CREATE TABLE IF NOT EXISTS cafes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  colors JSONB NOT NULL,
  tables INT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  cafe_id TEXT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  cafe_id TEXT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  table_num INT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'served', 'paid')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Waiter Floor Calls Table
CREATE TABLE IF NOT EXISTS waiter_calls (
  id TEXT PRIMARY KEY,
  cafe_id TEXT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  table_num INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assistance', 'water', 'bill')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'resolved')),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  cafe_id TEXT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enable Realtime subscriptions for orders and waiter calls
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_calls;

-- 7. Disable Row Level Security (RLS) for testing or configure policy rules
ALTER TABLE cafes DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE waiter_calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;

-- 8. Insert Initial Cafe Data
INSERT INTO cafes (id, name, email, logo_url, colors, tables)
VALUES (
  'unwind-cafe', 
  'Unvind Cafe', 
  'hello@unvindcafe.com', 
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
  '{"primary": "#016dc1", "primaryRgb": "1, 109, 193", "secondary": "#b5946a", "bg": "#fbfaf8", "card": "#ffffff", "text": "#08070f", "textMuted": "#66636a", "border": "#ebdccb"}',
  '{1, 2, 3, 4, 5}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_items (id, cafe_id, name, description, price, image, category, is_veg, is_available)
VALUES 
  ('item-1', 'unwind-cafe', 'Chipotle Bowl', 'Hearty brown rice, black beans, sweet corn, fresh avocado, sour cream, and chipotle dressing.', 10.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80', 'Best Sellers', true, true),
  ('item-2', 'unwind-cafe', 'Farm Fresh Pizza', 'Topped with cherry tomatoes, green bell peppers, olives, mushrooms, and fresh mozzarella cheese on a crispy sourdough crust.', 14.99, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80', 'Best Sellers', true, true),
  ('item-3', 'unwind-cafe', 'Matcha Latte', 'Premium grade Japanese matcha whisked with velvety steamed oat milk and a touch of honey.', 5.50, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80', 'Drinks', true, true),
  ('item-4', 'unwind-cafe', 'Avocado Sourdough Toast', 'Toasted rustic sourdough topped with smashed avocados, chili flakes, pumpkin seeds, and microgreens.', 8.50, 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&auto=format&fit=crop&q=80', 'General', true, true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Configure Environment Variables
Create a file named `.env` in the project root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
```

Restart your Vite server. The header of the dashboard will display a green **"Cloud Sync Active"** badge, and all updates will sync in real-time.
