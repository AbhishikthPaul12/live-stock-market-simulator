# API Documentation – Live Stock Market Simulator

This document provides a comprehensive guide to the backend API endpoints. All requests (except Auth) require a valid JWT token in the Authorization header as a Bearer token.

## Authentication

### Register

POST /api/auth/register
- **Body**: { "name": "...", "email": "...", "password": "..." }
- **Response**: User object with JWT token.

### Login

POST /api/auth/login
- **Body**: { "email": "...", "password": "..." }
- **Response**: User object with JWT token.

### Get Profile

GET /api/auth/profile
- **Response**: Current user profile including `walletBalance`, `realizedProfit`, and `realizedProfitToday`.

## Stocks & Market

### Get All Stocks

GET /api/stocks
- **Response**: Array of all stocks with live prices and daily changes.

### Get Stock Details

GET /api/stocks/:symbol
- **Response**: Detailed information for a specific stock.

### Get Stock History

GET /api/stocks/history/:symbol?timeframe=1M
- **Query Params**: timeframe (1D, 1W, 1M, 3M, 6M, 1YR, 3YRS).
- **Response**: Historical price data for charting.

## Trading & Portfolio

### Buy Stock

POST /api/trade/buy
- **Body**: { "symbol": "...", "quantity": 10 }
- **Action**: Deducts from wallet, updates/creates portfolio entry.

### Sell Stock

POST /api/trade/sell
- **Body**: { "symbol": "...", "quantity": 5 }
- **Action**: Adds proceeds to wallet, updates/deletes portfolio entry, records realized profit.

### Get Portfolio

GET /api/portfolio
- **Response**: Array of current holdings with buy prices and quantities.

### Get Transactions

GET /api/transactions
- **Response**: Full history of buy/sell transactions with profit/loss per sale.

## AI Features

### Portfolio Analysis

POST /api/ai/analyze-portfolio
- **Body**: Array of holdings.
- **Response**: AI-generated score, risk level, and diversification suggestions.

### Market News Summary

POST /api/ai/news-summary
- **Body**: Array of headlines.
- **Response**: Summarized news with sentiment analysis.

### Stock Insight

POST /api/ai/stock-insight
- **Body**: { "symbol": "...", "price": "...", "change": "..." }
- **Response**: AI commentary on a specific asset.

## Alerts & Watchlist

### Get Watchlist

GET /api/user/watchlist
- **Response**: Array of symbols in the user's watchlist.

### Add to Watchlist

POST /api/user/watchlist
- **Body**: { "symbol": "...", "name": "..." }

### Create Alert

POST /api/alerts
- **Body**: { "symbol": "...", "targetPrice": 4500, "condition": "above" }

## Leaderboard

### Get Global Rankings

GET /api/leaderboard
- **Response**: Top users ranked by total net value (Wallet + Portfolio).
