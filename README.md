# Finova UMKM Finance

Finova is a web-based financial management system designed to help UMKM owners record transactions, manage expenses, and gain AI-powered business insights.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Environment Setup
Create a `.env` file in both `frontend/` and `backend/` directories.

**Backend (.env):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Installation
Install dependencies for both frontend and backend:
```bash
# In frontend/
npm install

# In backend/
npm install
```

### 3. Running the App
```bash
# Start Backend
cd backend
npm run dev

# Start Frontend
cd frontend
npm run dev
```

## Demo Tips
- **AI Insights:** Ensure your products have `stock < 5` to see the "Low Stock Alert".
- **Trends:** Add transactions across different days to see the "Weekly Trend" bar chart update.
- **Insights:** Switch the period selector in the Insights page (All Time / This Month / This Year) to see how calculations change.
