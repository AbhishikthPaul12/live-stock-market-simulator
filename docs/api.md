# API Design – Stock Market Simulator

## 1. Wallet

### Get Wallet Balance

GET /api/wallet
Response:
{
"balance": 100000,
"invested": 25000
}

---

## 2. Trading

### Buy Stock

POST /api/trade/buy
Request:
{
"symbol": "TCS",
"quantity": 10
}

Response:
{
"message": "Stock purchased successfully",
"balance": 62000
}

---

### Sell Stock

POST /api/trade/sell
Request:
{
"symbol": "TCS",
"quantity": 5
}

Response:
{
"message": "Stock sold successfully",
"balance": 80000
}

---

## 3. Portfolio

### Get Portfolio

GET /api/portfolio

Response:
{
"stocks": [
{
"symbol": "TCS",
"quantity": 10,
"buyPrice": 3500,
"currentPrice": 3800,
"profit": 3000
}
],
"totalValue": 38000
}

---

## 4. Leaderboard

### Get Leaderboard

GET /api/leaderboard

Response:
[
{
"user": "User1",
"portfolioValue": 120000
},
{
"user": "User2",
"portfolioValue": 110000
}
]

---

## 5. Alerts

### Set Alert

POST /api/alerts

Request:
{
"symbol": "TCS",
"targetPrice": 4000
}

Response:
{
"message": "Alert set successfully"
}
