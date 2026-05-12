import axios from 'axios';
import Alert from '../models/Alert.js';

// Socket.IO instance — set by server.js after boot
let io = null;

/**
 * Called once from server.js to wire up the Socket.IO instance.
 * This starts broadcasting price updates to all connected clients.
 */
export function initSocketEmitter(socketIO) {
  io = socketIO;
  console.log("📡 Stock service Socket.IO emitter initialized");
}

// Helper: Google's S2 favicon service - guaranteed to return an image for any domain
const gFav = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
const tLogo = (domain) => `https://cdn.tickerlogos.com/${domain}`;

// Comprehensive Indian Market Asset Library (Nifty 50 + Major Midcaps)
const INITIAL_STOCKS = [
  // CONGLOMERATE & ENERGY
  { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd.", logo: gFav("ril.com") },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises Ltd.", logo: gFav("adani.com") },
  { symbol: "ONGC.NS",     name: "Oil & Natural Gas Corporation", logo: tLogo("ongcindia.com") },
  { symbol: "NTPC.NS",     name: "NTPC Limited", logo: tLogo("ntpc.co.in") },
  { symbol: "POWERGRID.NS",name: "Power Grid Corporation of India", logo: tLogo("powergridindia.com") },
  { symbol: "BPCL.NS",     name: "Bharat Petroleum Corporation", logo: tLogo("bharatpetroleum.in") },
  { symbol: "IOC.NS",      name: "Indian Oil Corporation", logo: tLogo("iocl.com") },
  { symbol: "COALINDIA.NS",name: "Coal India Limited", logo: tLogo("coalindia.in") },

  // BANKING & FINANCE
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Limited", logo: gFav("hdfcbank.com") },
  { symbol: "ICICIBANK.NS",name: "ICICI Bank Limited", logo: gFav("icicibank.com") },
  { symbol: "SBIN.NS",     name: "State Bank of India", logo: tLogo("sbi.co.in") },
  { symbol: "KOTAKBANK.NS",name: "Kotak Mahindra Bank Ltd.", logo: gFav("kotak.com") },
  { symbol: "AXISBANK.NS", name: "Axis Bank Limited", logo: gFav("axisbank.com") },
  { symbol: "BAJFINANCE.NS",name: "Bajaj Finance Limited", logo: gFav("bajajfinserv.in") },
  { symbol: "BAJAJFINSV.NS",name: "Bajaj Finserv Limited", logo: gFav("bajajfinserv.in") },
  { symbol: "HDFCLIFE.NS", name: "HDFC Life Insurance Company", logo: gFav("hdfclife.com") },
  { symbol: "SBILIFE.NS",  name: "SBI Life Insurance Company", logo: gFav("sbilife.co.in") },

  // INFORMATION TECHNOLOGY
  { symbol: "TCS.NS",      name: "Tata Consultancy Services", logo: tLogo("tcs.com") },
  { symbol: "INFY.NS",     name: "Infosys Limited", logo: gFav("infosys.com") },
  { symbol: "HCLTECH.NS",  name: "HCL Technologies Limited", logo: tLogo("hcltech.com") },
  { symbol: "WIPRO.NS",    name: "Wipro Limited", logo: gFav("wipro.com") },
  { symbol: "TECHM.NS",    name: "Tech Mahindra Limited", logo: gFav("techmahindra.com") },
  { symbol: "LTIM.NS",     name: "LTIMindtree Limited", logo: gFav("ltimindtree.com") },

  // AUTOMOTIVE
  { symbol: "TATAMOTORS.NS",name: "Tata Motors Limited", logo: gFav("tatamotors.com") },
  { symbol: "MARUTI.NS",   name: "Maruti Suzuki India Limited", logo: gFav("marutisuzuki.com") },
  { symbol: "MAHINDRA.NS", name: "Mahindra & Mahindra Limited", logo: gFav("mahindra.com") },
  { symbol: "EICHERMOT.NS",name: "Eicher Motors Limited", logo: gFav("eichermotors.com") },
  { symbol: "HEROMOTOCO.NS",name: "Hero MotoCorp Limited", logo: gFav("heromotocorp.com") },
  { symbol: "BAJAJ-AUTO.NS",name: "Bajaj Auto Limited", logo: gFav("bajajauto.com") },

  // FMCG & CONSUMPTION
  { symbol: "HINDUNILVR.NS",name: "Hindustan Unilever Limited", logo: gFav("hul.co.in") },
  { symbol: "ITC.NS",      name: "ITC Limited", logo: gFav("itcportal.com") },
  { symbol: "NESTLEIND.NS",name: "Nestle India Limited", logo: gFav("nestle.in") },
  { symbol: "BRITANNIA.NS",name: "Britannia Industries Limited", logo: gFav("britannia.co.in") },
  { symbol: "TITAN.NS",    name: "Titan Company Limited", logo: tLogo("titan.co.in") },
  { symbol: "ASIANPAINT.NS",name: "Asian Paints Limited", logo: tLogo("asianpaints.com") },
  { symbol: "DABUR.NS",    name: "Dabur India Limited", logo: tLogo("dabur.com") },

  // METALS & MINING
  { symbol: "TATASTEEL.NS",name: "Tata Steel Limited", logo: gFav("tatasteel.com") },
  { symbol: "JSWSTEEL.NS", name: "JSW Steel Limited", logo: gFav("jsw.in") },
  { symbol: "HINDALCO.NS", name: "Hindalco Industries Limited", logo: gFav("hindalco.com") },

  // HEALTHCARE & PHARMA
  { symbol: "SUNPHARMA.NS",name: "Sun Pharmaceutical Industries", logo: gFav("sunpharma.com") },
  { symbol: "CIPLA.NS",    name: "Cipla Limited", logo: gFav("cipla.com") },
  { symbol: "DRREDDY.NS",  name: "Dr. Reddy's Laboratories", logo: gFav("drreddys.com") },
  { symbol: "APOLLOHOSP.NS",name: "Apollo Hospitals Enterprise", logo: gFav("apollohospitals.com") },
  { symbol: "DIVISLAB.NS", name: "Divi's Laboratories Ltd.", logo: gFav("divislabs.com") },

  // INDUSTRIALS & INFRASTRUCTURE
  { symbol: "LT.NS",       name: "Larsen & Toubro Limited", logo: gFav("larsentoubro.com") },
  { symbol: "ULTRACEMCO.NS",name: "UltraTech Cement Limited", logo: gFav("ultratechcement.com") },
  { symbol: "GRASIM.NS",   name: "Grasim Industries Limited", logo: tLogo("grasim.com") },
  { symbol: "ADANIPORTS.NS",name: "Adani Ports and SEZ Ltd.", logo: gFav("adaniports.com") },
  { symbol: "BHARTIARTL.NS",name: "Bharti Airtel Limited", logo: gFav("airtel.in") }
];

// Deterministic price generator scaled to INR values
const generateDeterministicPrice = (symbol) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const base = 200 + (Math.abs(hash) % 4500);
  const cents = (Math.abs(hash) % 100) / 100;
  return Number((base + cents).toFixed(2));
};

// In-Memory Cache
const stockCache = {};
const sessionHistory = {}; // Stores last 60 minutes of price points

INITIAL_STOCKS.forEach(stock => {
  const startPrice = generateDeterministicPrice(stock.symbol);
  stockCache[stock.symbol] = {
    ...stock,
    price: startPrice,
    openPrice: startPrice,
    change: 0
  };
  sessionHistory[stock.symbol] = [];
});

// ─── Real-Time Simulation Engine (replaces Finnhub API) ─────────────────────
// Simulates realistic price movement using random-walk with momentum/mean-reversion.
// Broadcasts updates via Socket.IO every second.
let currentIndex = 0;
const BATCH_SIZE = 5;

setInterval(async () => {
  const batch = INITIAL_STOCKS.slice(currentIndex, currentIndex + BATCH_SIZE);
  if (batch.length === 0) { currentIndex = 0; return; }

  const updatedStocks = [];

  await Promise.all(batch.map(async (stock) => {
    const sym = stock.symbol;
    const currentPrice = stockCache[sym].price;

    // Realistic random-walk price simulation
    // Volatility ranges from 0.02% to 0.08% per tick depending on price tier
    const volatility = currentPrice > 2000 ? 0.0003 : 0.0006;
    const drift = (Math.random() - 0.498) * volatility; // slight upward bias
    const newPrice = Number((currentPrice * (1 + drift)).toFixed(2));
    const openPrice = stockCache[sym].openPrice || currentPrice;
    const priceChange = Number(((newPrice - openPrice) / openPrice * 100).toFixed(2));

    stockCache[sym].price = newPrice;
    stockCache[sym].change = priceChange;

    // Record session history point
    const historyPoint = {
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      price: newPrice,
      timestamp: Date.now()
    };
    
    sessionHistory[sym].push(historyPoint);
    if (sessionHistory[sym].length > 100) sessionHistory[sym].shift(); // Keep last 100 points

    // Collect updated stock for Socket.IO broadcast
    updatedStocks.push(stockCache[sym]);

    // Evaluate price alerts (unchanged logic)
    try {
      const triggeredAlerts = await Alert.find({ symbol: sym, triggered: false });
      for (const alert of triggeredAlerts) {
        if ((alert.type === 'ABOVE' && newPrice >= alert.targetPrice) ||
            (alert.type === 'BELOW' && newPrice <= alert.targetPrice)) {
          alert.triggered = true;
          await alert.save();

          // Emit alert triggered event via Socket.IO
          if (io) {
            io.emit('alertTriggered', {
              _id: alert._id,
              symbol: sym,
              type: alert.type,
              targetPrice: alert.targetPrice,
              triggeredAt: new Date().toISOString()
            });
          }
        }
      }
    } catch (err) {
      console.error("Error evaluating alerts:", err.message);
    }
  }));

  // Broadcast updated stock prices to ALL connected Socket.IO clients
  if (io && updatedStocks.length > 0) {
    io.emit('stockUpdate', updatedStocks);
  }

  currentIndex = (currentIndex + BATCH_SIZE) % INITIAL_STOCKS.length;
}, 1000);

// ─── Exported Functions (unchanged API surface) ─────────────────────────────

export const getAllStocks = async () => Object.values(stockCache);

// Helper to resolve aliases (e.g., user types "INFY", we map it to "INFY.NS" if it exists)
export const getCanonicalSymbol = (symbol) => {
  if (!symbol) return "";
  const sym = symbol.toUpperCase();
  if (stockCache[sym]) return sym;
  
  // Try common derivations
  if (stockCache[`${sym}.NS`]) return `${sym}.NS`;
  if (sym.endsWith(".NS") && stockCache[sym.slice(0, -3)]) return sym.slice(0, -3);
  
  // Deep search prefix matches if not found (optional safety)
  const match = Object.keys(stockCache).find(k => k.split('.')[0] === sym.split('.')[0]);
  if (match) return match;

  return sym;
};

export const getStockPrice = async (symbol) => {
  const sym = getCanonicalSymbol(symbol);
  if (stockCache[sym]) return { price: stockCache[sym].price, change: stockCache[sym].change };
  
  // Fallback: generate a deterministic price for unknown symbols
  const fallbackSym = symbol.toUpperCase();
  return { price: generateDeterministicPrice(fallbackSym), change: 0.15 };
};

export const getStockData = async (symbol) => {
  const sym = getCanonicalSymbol(symbol);
  if (stockCache[sym]) return stockCache[sym];
  
  // Fallback for unknown symbols - keep original symbol case-normed
  const origSym = symbol.toUpperCase();
  return { symbol: origSym, name: `${origSym} India`, price: generateDeterministicPrice(origSym), change: 0.45, logo: "" };
};

const generateMockHistory = async (symbol, timeframe = '1M') => {
  const { price } = await getStockPrice(symbol);
  const basePrice = price || 1500;
  const history = [];
  const now = Date.now();
  let points = 30, interval = 24 * 60 * 60 * 1000;
  if (timeframe === '1D') { points = 48; interval = 30 * 60 * 1000; } // 30 min intervals for 1 day
  else if (timeframe === '1W') { points = 7; interval = 24 * 60 * 60 * 1000; }
  else if (timeframe === '1M') { points = 30; interval = 24 * 60 * 60 * 1000; }
  else if (timeframe === '3M') { points = 90; interval = 24 * 60 * 60 * 1000; }
  else if (timeframe === '6M') { points = 180; interval = 24 * 60 * 60 * 1000; }
  else if (timeframe === '1YR') { points = 365; interval = 24 * 60 * 60 * 1000; }
  else if (timeframe === '3YRS') { points = 36; interval = 30 * 24 * 60 * 60 * 1000; } // Monthly for 3 years
  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * interval);
    // Add a cumulative trend for realism
    const trend = (i / points) * (basePrice * 0.15) * (Math.abs(basePrice % 2) - 1); // Simple deterministic trend
    const noise = (Math.random() - 0.5) * (basePrice * 0.08);
    const dateObj = new Date(timestamp);
    let dateStr;

    if (timeframe === '1D') {
      dateStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (timeframe === '1YR') {
      dateStr = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    } else if (timeframe === '3YRS') {
      dateStr = dateObj.toLocaleDateString('en-IN', { year: 'numeric' });
    } else if (['3M', '6M'].includes(timeframe)) {
      dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } else {
      dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }

    history.push({
      date: dateStr,
      price: parseFloat((basePrice - trend + noise).toFixed(2)),
      timestamp: timestamp
    });
  }
  return history;
};

export const getStockHistory = async (symbol, timeframe = '1M') => {
  const sym = symbol.toUpperCase();
  // Use mock/simulation history directly (no external API needed)
  const mockData = await generateMockHistory(symbol, timeframe);
  if (timeframe === '1D' && sessionHistory[sym]?.length > 0) {
     // Filter mock data that might overlap with session history
     const lastSessionTs = sessionHistory[sym][0].timestamp;
     const filteredMock = mockData.filter(m => (m.timestamp || 0) < lastSessionTs);
     return [...filteredMock, ...sessionHistory[sym]];
  }
  return mockData;
};
