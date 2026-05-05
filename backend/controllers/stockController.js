export const getStocks = (req, res) => {
  res.json([
    { symbol: "TCS", price: 4000 },
    { symbol: "INFY", price: 1600 },
    { symbol: "RELIANCE", price: 2600 }
  ]);
};