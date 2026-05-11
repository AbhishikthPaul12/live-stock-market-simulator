import { useState, useEffect } from 'react';
import { getStockData } from '../api/data.js';
import { useSocket } from '../context/SocketContext.jsx';

export function useStockPrices(symbol) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { livePrices } = useSocket();

  // Initial fetch via REST API for loading state
  useEffect(() => {
    if (!symbol) {
      setStock(null);
      setError(null);
      return;
    }

    let isMounted = true;

    async function fetchStock() {
      try {
        const result = await getStockData(symbol);
        if (!isMounted) return;

        if (result) {
          setStock(result);
          setError(null);
        } else {
          setError("Stock not available");
        }
      } catch (err) {
        if (!isMounted) return;
        setError("Stock not available");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    setLoading(true);
    fetchStock();

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  // Update stock data from Socket.IO whenever new prices arrive
  useEffect(() => {
    if (!symbol) return;
    const sym = symbol.toUpperCase();
    if (livePrices[sym]) {
      setStock(livePrices[sym]);
      setError(null);
    }
  }, [livePrices, symbol]);

  return { stock, loading, error };
}
