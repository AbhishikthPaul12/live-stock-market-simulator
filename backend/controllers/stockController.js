import { getAllStocks as fetchAllStocks, getStockData as fetchStockData, getStockHistory as fetchStockHistory } from '../services/stockService.js';

export const getAllStocks = async (req, res) => {
  try {
    const data = await fetchAllStocks();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching stocks' });
  }
};

export const getStockBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ message: 'Stock symbol is required' });
    }
    const data = await fetchStockData(symbol);
    if (!data) {
      return res.status(404).json({ message: 'Stock not available' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching stock' });
  }
};

export const getStockHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    if (!symbol) {
      return res.status(400).json({ message: 'Stock symbol is required' });
    }
    const history = await fetchStockHistory(symbol, timeframe);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching history' });
  }
};