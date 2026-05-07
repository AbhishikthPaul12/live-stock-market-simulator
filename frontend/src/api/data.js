import axios from "./axios";

// WATCHLIST
export const getWatchlist = async () => {
  const res = await axios.get("/user/watchlist");
  return res.data;
};

export const addToWatchlist = async (stock) => {
  await axios.post("/user/watchlist", stock);
};

export const removeFromWatchlist = async (symbol) => {
  await axios.delete(`/user/watchlist/${symbol}`);
};

// LEADERBOARD
export const getLeaderboard = async () => {
  const res = await axios.get("/leaderboard");
  return res.data;
};

// ALERTS
export const getAlerts = async () => {
  const res = await axios.get("/alerts");
  return res.data;
};

export const createAlert = async (alertData) => {
  const res = await axios.post("/alerts", alertData);
  return res.data;
};

export const deleteAlert = async (id) => {
  const res = await axios.delete(`/alerts/${id}`);
  return res.data;
};

// PORTFOLIO
export const getPortfolio = async () => {
  const res = await axios.get("/portfolio");
  return res.data;
};

// WALLET
export const getWallet = async () => {
  const res = await axios.get("/user/wallet");
  return res.data;
};

// TRANSACTIONS
export const getTransactions = async () => {
  const res = await axios.get("/transactions");
  return res.data;
};

// STOCKS
export const getAllStocks = async () => {
  const res = await axios.get(`/stocks/all`);
  return res.data;
};

export const getStockData = async (symbol) => {
  const res = await axios.get(`/stocks/${symbol}`);
  return res.data;
};

export const getStockHistory = async (symbol) => {
  const res = await axios.get(`/stocks/${symbol}/history`);
  return res.data;
};