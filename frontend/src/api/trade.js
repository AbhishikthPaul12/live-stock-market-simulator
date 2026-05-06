import API from "./axios.js";

export async function buyStock(data) {
  const res = await API.post("/trade/buy", data);
  return res.data;
}

export async function sellStock(data) {
  const res = await API.post("/trade/sell", data);
  return res.data;
}

export async function getTransactions() {
  const res = await API.get("/trade/transactions");
  return res.data;
}