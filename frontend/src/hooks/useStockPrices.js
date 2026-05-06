import { useState, useEffect } from 'react';
import { getStockData } from '../api/data.js';

export function useStockPrices(symbol) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    const intervalId = setInterval(fetchStock, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [symbol]);

  return { stock, loading, error };
}
