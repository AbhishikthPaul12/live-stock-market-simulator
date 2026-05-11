import { createContext, useContext, useState, useEffect } from "react";
import socket from "../api/socket.js";

const SocketContext = createContext({
  livePrices: {},   // { "RELIANCE.NS": { symbol, name, price, change, logo } }
  connected: false,
  alertEvents: []
});

export function SocketProvider({ children }) {
  const [livePrices, setLivePrices] = useState({});
  const [connected, setConnected] = useState(socket.connected);
  const [alertEvents, setAlertEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    // Receives batches of updated stocks from the backend every ~1s
    function onStockUpdate(updatedStocks) {
      setLivePrices((prev) => {
        const next = { ...prev };
        for (const stock of updatedStocks) {
          next[stock.symbol] = stock;
        }
        return next;
      });
    }

    // Receives triggered alert events in real-time
    function onAlertTriggered(alertData) {
      setAlertEvents((prev) => [...prev, alertData]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("stockUpdate", onStockUpdate);
    socket.on("alertTriggered", onAlertTriggered);

    // If already connected when this mounts
    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("stockUpdate", onStockUpdate);
      socket.off("alertTriggered", onAlertTriggered);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ livePrices, connected, alertEvents }}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to access live stock prices from Socket.IO.
 * Returns:
 *   livePrices  — object keyed by symbol, each value is the full stock object
 *   connected   — boolean indicating Socket.IO connection status
 *   alertEvents — array of alert-triggered events received in this session
 */
export function useSocket() {
  return useContext(SocketContext);
}
