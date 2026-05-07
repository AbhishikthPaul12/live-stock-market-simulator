import Alert from "../models/Alert.js";

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAlert = async (req, res) => {
  try {
    const { symbol, targetPrice, type } = req.body;
    const alert = await Alert.create({
      user: req.user._id,
      symbol: symbol.toUpperCase(),
      targetPrice,
      type
    });
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await alert.deleteOne();
    res.json({ message: "Alert removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};