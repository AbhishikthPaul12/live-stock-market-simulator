# Live Stock Market Simulator (Indian Equity Edition)

A premium, full-stack stock market simulation platform tailored for the **Indian Equity Market (NSE)**. This platform allows users to trade Nifty 50 stocks with virtual capital, leverage AI-driven insights for decision-making, and track real-time portfolio performance with high-fidelity analytics.

## Premium Features

### AI-Powered Intelligence
*   **Portfolio Analysis**: Deep AI evaluation of your holdings with risk scoring and diversification suggestions.
*   **Market Sentiment**: Real-time AI summarization of global news headlines with sentiment classification (Bullish/Bearish/Neutral).
*   **Trend Forecasting**: Interactive AI Trend Forecast charts providing predictive technical analysis for every stock.
*   **AI Chatbot**: Intelligent assistant to help with trading strategies and market concepts.

###  Professional Analytics

*   **High-Fidelity Charts**: Interactive Area Charts powered by Recharts with multi-timeframe support (1D to 3YRS).
*   **Live Order Book**: Real-time price updates via Socket.io ensuring millisecond-level synchronization with market feeds.
*   **Performance Tracking**: Accurate calculation of Realized P&L, Unrealized Gains, and Day's G/L including intraday realized profits.

### 🇮🇳 Indian Market Focus
*   **NSE Data Integration**: Real-time tracking of Nifty 50 companies with authentic corporate logos and market indices (NIFTY 50, SENSEX, BANK NIFTY).
*   **Market Status**: Dynamic detection of Indian market hours (IST 09:15 - 15:30) with status indicators.

## Tech Stack

 **Frontend**  React.js, Tailwind CSS, Recharts, Lucide Icons |
 **Backend**  Node.js, Express.js, JWT Authentication |
 **Database**  MongoDB (Mongoose ODM) |
 **Real-time**  Socket.io (Bi-directional live feed) |
 **AI Integration**  Google Gemini / OpenAI (Insights & Summaries) |

##  Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance
- API Key for AI services (optional but recommended for full features)

### Backend Setup
1. Navigate to `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env` file with your `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
4. Start server: `npm run dev`

### Frontend Setup
1. Navigate to `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Project Structure

├── backend/
│   ├── config/          # Database & Socket configurations
│   ├── controllers/     # Business logic for all API endpoints
│   ├── middleware/      # Auth & Error handling
│   ├── models/          # Mongoose Schemas (User, Portfolio, Transaction)
│   ├── routes/          # Express API routes
│   └── services/        # External API & AI service integrations
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios & Socket client logic
│   │   ├── components/  # Reusable UI & Charting components
│   │   ├── context/     # Global state (Auth, Toast, Socket)
│   │   └── pages/       # High-level page views
└── docs/                # API Documentation & Guides

---

## Contributors

*   **Member 1** – Vamshi Krishna Kommu (24EG105F33)
*   **Member 2** – Abhiram Valmeekam (24EG105H01)
*   **Member 3** – Abhishikth Paul Ganta (24EG105H02)
*   **Member 4** – Dingari Vikram (24EG105K19)
*   **Member 5** – Kandlakuntla Bharadwaj (24EG105K27)

