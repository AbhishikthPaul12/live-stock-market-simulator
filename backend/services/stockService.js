import axios from 'axios';
import Alert from '../models/Alert.js';

// 20 Top Tech Companies
// 40+ Diverse Companies across sectors
const INITIAL_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc", price: 175.50, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AAPL.png" },
  { symbol: "MSFT", name: "Microsoft Corp", price: 330.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MSFT.png" },
  { symbol: "NVDA", name: "NVIDIA Corp", price: 460.18, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NVDA.png" },
  { symbol: "GOOGL", name: "Alphabet Inc", price: 135.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GOOG.png" },
  { symbol: "AMZN", name: "Amazon.com Inc", price: 130.00, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMZN.png" },
  { symbol: "TSLA", name: "Tesla Inc", price: 240.50, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/TSLA.png" },
  { symbol: "META", name: "Meta Platforms", price: 300.10, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/FB.png" },
  { symbol: "NFLX", name: "Netflix Inc", price: 400.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NFLX.png" },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 105.30, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMD.png" },
  { symbol: "INTC", name: "Intel Corp", price: 35.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/INTC.png" },
  { symbol: "V", name: "Visa Inc", price: 230.15, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/V.png" },
  { symbol: "MA", name: "Mastercard Inc", price: 400.80, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MA.png" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 145.60, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/JPM.png" },
  { symbol: "BAC", name: "Bank of America", price: 28.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BAC.png" },
  { symbol: "GS", name: "Goldman Sachs", price: 320.50, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GS.png" },
  { symbol: "WMT", name: "Walmart Inc", price: 160.25, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/WMT.png" },
  { symbol: "COST", name: "Costco Wholesale", price: 550.30, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/COST.png" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 165.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/JNJ.png" },
  { symbol: "PFE", name: "Pfizer Inc", price: 30.10, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PFE.png" },
  { symbol: "UNH", name: "UnitedHealth Group", price: 480.60, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/UNH.png" },
  { symbol: "XOM", name: "Exxon Mobil", price: 110.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/XOM.png" },
  { symbol: "CVX", name: "Chevron Corp", price: 165.70, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/CVX.png" },
  { symbol: "BA", name: "Boeing Co", price: 210.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BA.png" },
  { symbol: "GE", name: "General Electric", price: 115.80, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GE.png" },
  { symbol: "DIS", name: "Walt Disney Co", price: 95.30, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/DIS.png" },
  { symbol: "NKE", name: "Nike Inc", price: 105.15, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NKE.png" },
  { symbol: "SBUX", name: "Starbucks Corp", price: 98.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/SBUX.png" },
  { symbol: "MCD", name: "McDonald's Corp", price: 285.60, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MCD.png" },
  { symbol: "KO", name: "Coca-Cola Co", price: 58.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/KO.png" },
  { symbol: "PEP", name: "PepsiCo Inc", price: 175.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PEP.png" },
  { symbol: "T", name: "AT&T Inc", price: 15.60, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/T.png" },
  { symbol: "VZ", name: "Verizon", price: 35.80, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/VZ.png" },
  { symbol: "CSCO", name: "Cisco Systems", price: 52.30, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/CSCO.svg" },
  { symbol: "ORCL", name: "Oracle Corp", price: 110.15, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ORCL.png" },
  { symbol: "CRM", name: "Salesforce Inc", price: 220.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/CRM.png" },
  { symbol: "ADBE", name: "Adobe Inc", price: 540.80, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ADBE.png" },
  { symbol: "PYPL", name: "PayPal Holdings", price: 60.10, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PYPL.png" },
  { symbol: "SQ", name: "Block Inc", price: 55.40, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/SQ.png" },
  { symbol: "SHOP", name: "Shopify Inc", price: 65.20, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/SHOP.png" },
  { symbol: "UBER", name: "Uber Technologies", price: 45.30, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/UBER.png" },
  { symbol: "ABNB", name: "Airbnb Inc", price: 130.15, logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ABNB.png" }
];

// Helper to generate deterministic mock price based on symbol
const generateDeterministicPrice = (symbol) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const base = 50 + (Math.abs(hash) % 800); // Price between 50 and 850
  const cents = (Math.abs(hash) % 100) / 100;
  return Number((base + cents).toFixed(2));
};

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
let currentIndex = 0;

setInterval(async () => {
  const sym = INITIAL_STOCKS[currentIndex].symbol;
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error("No API Key");
    
    const res = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: { symbol: sym, token: apiKey }
    });

    if (res.data && res.data.c) {
      const fluctuation = 1 + (Math.random() - 0.5) * 0.0002;
      stockCache[sym].price = Number((res.data.c * fluctuation).toFixed(2));
      stockCache[sym].change = Number(res.data.d.toFixed(2));
    } else {
      throw new Error("Invalid response");
    }

    // CHECK ALERTS FOR THIS SYMBOL
    const currentPrice = stockCache[sym].price;
    const triggeredAlerts = await Alert.find({ symbol: sym, triggered: false });
    for (const alert of triggeredAlerts) {
      if ((alert.type === 'ABOVE' && currentPrice >= alert.targetPrice) ||
          (alert.type === 'BELOW' && currentPrice <= alert.targetPrice)) {
        alert.triggered = true;
        await alert.save();
      }
    }
  } catch (error) {
    // Deterministic Mock movement if API fails or key is missing
    const currentPrice = stockCache[sym].price;
    const fluctuation = 1 + (Math.random() - 0.5) * 0.0005;
    stockCache[sym].price = Number((currentPrice * fluctuation).toFixed(2));
    stockCache[sym].change = Number(((stockCache[sym].price - currentPrice) / currentPrice * 100).toFixed(2));

    // CHECK ALERTS FOR MOCK PRICE
    const triggeredAlerts = await Alert.find({ symbol: sym, triggered: false });
    for (const alert of triggeredAlerts) {
      if ((alert.type === 'ABOVE' && stockCache[sym].price >= alert.targetPrice) ||
          (alert.type === 'BELOW' && stockCache[sym].price <= alert.targetPrice)) {
        alert.triggered = true;
        await alert.save();
      }
    }
  }

  currentIndex = (currentIndex + 1) % INITIAL_STOCKS.length;
}, 1500);


export const getAllStocks = async () => {
  return Object.values(stockCache);
};

export const getStockPrice = async (symbol) => {
  try {
    const sym = symbol.toUpperCase();
    
    if (stockCache[sym]) {
      return { 
        price: stockCache[sym].price, 
        change: stockCache[sym].change 
      };
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error('API Key missing');

    const res = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: { symbol: sym, token: apiKey }
    });

    if (res.data.c) {
      return { 
        price: Number(res.data.c.toFixed(2)), 
        change: Number(res.data.d.toFixed(2)) 
      };
    }
    throw new Error("Not found");
  } catch (error) {
    const price = generateDeterministicPrice(symbol.toUpperCase());
    return { price, change: 0.25 };
  }
};

export const getStockData = async (symbol) => {
  try {
    const sym = symbol.toUpperCase();

    if (stockCache[sym]) {
      return stockCache[sym];
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error('API Key missing');
    
    const [quoteRes, profileRes] = await Promise.all([
      axios.get(`https://finnhub.io/api/v1/quote`, { params: { symbol: sym, token: apiKey } }),
      axios.get(`https://finnhub.io/api/v1/stock/profile2`, { params: { symbol: sym, token: apiKey } })
    ]);

    const quote = quoteRes.data;
    const profile = profileRes.data;
    
    if (quote.c === 0 && !profile.name) {
       throw new Error("Not found");
    }

    return {
      symbol: sym,
      name: profile.name || sym,
      price: Number(quote.c.toFixed(2)),
      change: Number(quote.d.toFixed(2)),
      logo: profile.logo || ""
    };
  } catch (error) {
    const price = generateDeterministicPrice(symbol.toUpperCase());
    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Global Systems`,
      price: price,
      change: 0.85,
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
