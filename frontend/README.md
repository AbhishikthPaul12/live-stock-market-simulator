# StockSim AI Frontend

A premium, glassmorphic UI built with React.js, designed to provide an institutional-grade trading experience for the Indian stock market.

## Key UX Components

### Real-Time Dashboard
- **Socket Integration**: Listens for live price feeds to update portfolios and charts instantly without page refreshes.
- **Dynamic Charts**: Multi-timeframe area charts (1D, 1W, 1M, 1YR, 3YRS) with responsive crosshairs.

### AI Learning Hub
- **Interactive Tutor**: A dedicated section to ask AI about market concepts.
- **Smart Insights**: Per-stock AI summaries that explain price action using simulated market news.

### Professional Feedback
- **Toast System**: Custom-built notification system for all app interactions.
- **Demo Mode**: Instant access with pre-seeded data for rapid evaluation.

## Technology Stack

- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS & Framer Motion
- **Charting**: Recharts
- **Icons**: Lucide React
- **State Management**: Context API (Auth, Socket, Toasts)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Setup environment**:
   Create a `.env` in the root (optional if running via the backend server):
   ```env
   VITE_API_URL=http://localhost:5000
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Build for Production**:
   ```bash
   npm run build
   ```
