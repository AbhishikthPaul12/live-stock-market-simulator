import axios from 'axios';

// 20 Top Tech Companies
const INITIAL_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc", price: 175.50, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AAPL.png" },
  { symbol: "MSFT", name: "Microsoft Corp", price: 330.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MSFT.png" },
  { symbol: "NVDA", name: "NVIDIA Corp", price: 460.18, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NVDA.png" },
  { symbol: "GOOGL", name: "Alphabet Inc", price: 135.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GOOGL.png" },
  { symbol: "AMZN", name: "Amazon.com Inc", price: 130.00, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMZN.png" },
  { symbol: "TSLA", name: "Tesla Inc", price: 240.50, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/TSLA.png" },
  { symbol: "META", name: "Meta Platforms", price: 300.10, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/META.png" },
  { symbol: "NFLX", name: "Netflix Inc", price: 400.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NFLX.png" },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 105.30, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMD.png" },
  { symbol: "INTC", name: "Intel Corp", price: 35.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/INTC.png" },
  { symbol: "BABA", name: "Alibaba Group", price: 90.50, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BABA.png" },
  { symbol: "V", name: "Visa Inc", price: 230.15, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/V.png" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 145.60, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/JPM.png" },
  { symbol: "WMT", name: "Walmart Inc", price: 160.25, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/WMT.png" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 165.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/JNJ.png" },
  { symbol: "PG", name: "Procter & Gamble", price: 155.10, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PG.png" },
  { symbol: "MA", name: "Mastercard Inc", price: 400.80, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MA.png" },
  { symbol: "HD", name: "Home Depot Inc", price: 330.45, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/HD.png" },
  { symbol: "CVX", name: "Chevron Corp", price: 165.70, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/CVX.png" },
  { symbol: "LLY", name: "Eli Lilly & Co", price: 540.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/LLY.png" }
];

// In-Memory Cache
const stockCache = {};

// Initialize Cache
INITIAL_STOCKS.forEach(stock => {
  stockCache[stock.symbol] = {
    ...stock,
    change: 0
  };
});

// TRUE REAL-TIME ENGINE: Fetch 1 stock from Finnhub every 1.5 seconds.
// This perfectly distributes 40 API calls per minute, keeping us under the 60 calls/min limit!
let currentIndex = 0;

setInterval(async () => {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) return;

    const symbolToUpdate = INITIAL_STOCKS[currentIndex].symbol;
    
    const res = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: { symbol: symbolToUpdate, token: apiKey }
    });

    if (res.data && res.data.c) {
      stockCache[symbolToUpdate].price = res.data.c;
      stockCache[symbolToUpdate].change = res.data.d;
    }
  } catch (error) {
    // If Finnhub rate limits or fails, we just keep the cached price.
    console.warn("Background fetch failed for", INITIAL_STOCKS[currentIndex].symbol, error.message);
  }

  // Move to next stock
  currentIndex = (currentIndex + 1) % INITIAL_STOCKS.length;
}, 1500);


export const getAllStocks = async () => {
  // Instantly return the true real-time cache! 0 instant API calls.
  return Object.values(stockCache);
};

export const getStockPrice = async (symbol) => {
  try {
    const sym = symbol.toUpperCase();
    
    // If it's in our local real-time cache, serve it instantly!
    if (stockCache[sym]) {
      return { price: stockCache[sym].price, change: stockCache[sym].change };
    }

    // Otherwise, fetch from Finnhub (Custom Search)
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error('FINNHUB_API_KEY is missing');

    const res = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: { symbol: sym, token: apiKey }
    });

    if (res.data.c) {
      return { price: res.data.c, change: res.data.d };
    }
    throw new Error("Invalid Finnhub response");

  } catch (error) {
    console.error("Price API Error, falling back to mock:", error.message);
    return { price: 150.00, change: 1.25 };
  }
};

export const getStockData = async (symbol) => {
  try {
    const sym = symbol.toUpperCase();

    // If it's in our grid, return instantly!
    if (stockCache[sym]) {
      return stockCache[sym];
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error('FINNHUB_API_KEY is missing');
    
    const [quoteRes, profileRes] = await Promise.all([
      axios.get(`https://finnhub.io/api/v1/quote`, { params: { symbol: sym, token: apiKey } }),
      axios.get(`https://finnhub.io/api/v1/stock/profile2`, { params: { symbol: sym, token: apiKey } })
    ]);

    const quote = quoteRes.data;
    const profile = profileRes.data;
    
    if (quote.c === 0 && !profile.name) {
       throw new Error("Stock not found on Finnhub");
    }

    return {
      symbol: sym,
      name: profile.name || sym,
      price: quote.c || 0,
      change: quote.d || 0,
      logo: profile.logo || ""
    };
  } catch (error) {
    console.warn(`Search failed for ${symbol}, generating mock fallback:`, error.message);
    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Corp (Mocked)`,
      price: 150.00,
      change: 1.25,
      logo: ""
    };
  }
};

const generateMockHistory = async (symbol) => {
  const { price } = await getStockPrice(symbol);
  const basePrice = price || 150;
  const history = [];
  const to = Math.floor(Date.now() / 1000);
  
  for (let i = 30; i >= 0; i--) {
    const timestamp = to - (i * 24 * 60 * 60);
    const noise = (Math.random() - 0.5) * (basePrice * 0.05);
    history.push({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      price: parseFloat((basePrice + noise).toFixed(2))
    });
  }
  return history;
};

export const getStockHistory = async (symbol) => {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error('FINNHUB_API_KEY is missing');

    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 60 * 60);

    const res = await axios.get(`https://finnhub.io/api/v1/stock/candle`, {
      params: {
        symbol: symbol.toUpperCase(),
        resolution: 'D',
        from,
        to,
        token: apiKey
      }
    });

    if (res.data.s !== 'ok' || res.data.error) {
      console.warn("Finnhub candle data restricted, returning mock history.");
      return await generateMockHistory(symbol);
    }

    return res.data.t.map((time, i) => ({
      date: new Date(time * 1000).toLocaleDateString(),
      price: res.data.c[i]
    }));
  } catch (error) {
    console.warn("History API Error, returning mock history:", error.message);
    return await generateMockHistory(symbol);
  }
};
