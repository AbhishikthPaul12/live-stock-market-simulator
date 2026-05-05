import { createContext, useState } from "react";

export const AppContext = createContext();

function AppProvider(props) {
  const [balance, setBalance] = useState(100000);
  const [portfolio, setPortfolio] = useState([]);
  const [realizedProfit, setRealizedProfit] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  // BUY STOCK
  function buyStock(symbol, price, quantity) {
    const totalCost = price*quantity;

    if (balance < totalCost) {
      alert("Not enough balance");
      return;
    }

    const existing = portfolio.find(
      (item) => item.symbol===symbol
    );

    // Update balance
    setBalance((prev) => prev-totalCost);

    // Update portfolio
    setPortfolio((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.symbol === symbol
            ? {
                ...item,
                quantity: item.quantity + quantity
              }
            : item
        );
      } else {
        return [
          ...prev,
          { symbol, quantity, buyPrice: price }
        ];
      }
    });

    // Add transaction (ONLY ONCE)
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: "BUY",
        symbol,
        quantity,
        price,
        date: new Date().toLocaleString()
      },
      ...prev
    ]);
  }

  // SELL STOCK
  function sellStock(symbol, sellPrice, quantity) {
    const existing = portfolio.find(
      (item) => item.symbol===symbol
    );

    if (!existing || existing.quantity<quantity) {
      alert("Not enough shares");
      return;
    }

    // Calculate profit
    const profit =
      (sellPrice - existing.buyPrice)*quantity;

    // Update portfolio
    setPortfolio((prev) =>
      prev
        .map((item) =>
          item.symbol === symbol
            ? {
                ...item,
                quantity: item.quantity-quantity
              }
            : item
        )
        .filter((item) => item.quantity>0)
    );

    // Update balance
    setBalance((bal) => bal+sellPrice*quantity);

    // Update realized profit
    setRealizedProfit((prev) => prev+profit);

    // Add transaction (ONLY ONCE)
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: "SELL",
        symbol,
        quantity,
        price: sellPrice,
        date: new Date().toLocaleString()
      },
      ...prev
    ]);
  }

  // WATCHLIST
  function addToWatchlist(stock) {
    setWatchlist((prev) => {
      const exists = prev.find(
        (item) => item.symbol === stock.symbol
      );
      if (exists) return prev;
      return [...prev, stock];
    });
  }

  function removeFromWatchlist(symbol) {
    setWatchlist((prev) =>
      prev.filter((item) => item.symbol !== symbol)
    );
  }

  return (
    <AppContext.Provider
      value={{
        balance,
        portfolio,
        realizedProfit,
        transactions,
        watchlist,
        buyStock,
        sellStock,
        addToWatchlist,
        removeFromWatchlist
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

export default AppProvider