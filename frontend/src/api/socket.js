import { io } from "socket.io-client";

// Singleton Socket.IO client — connects to the backend server
const SOCKET_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin;

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ["websocket", "polling"]
});

socket.on("connect", () => {
  console.log("🔌 Socket.IO connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket.IO disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.warn("🔌 Socket.IO connection error:", err.message);
});

export default socket;
