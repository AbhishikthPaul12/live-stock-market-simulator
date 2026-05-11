import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAnnouncements } from "../../api/admin.js";

export default function AINotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync with localStorage for read status
  const getReadStatus = () => JSON.parse(localStorage.getItem("read_alerts") || "[]");
  const saveReadStatus = (ids) => localStorage.setItem("read_alerts", JSON.stringify(ids));

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      const readIds = getReadStatus();
      
      const mapped = data.map(ann => ({
        id: ann._id,
        type: ann.type || "info",
        title: ann.title,
        message: ann.content,
        time: new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: readIds.includes(ann._id),
        date: new Date(ann.createdAt)
      }));

      // Add some mock AI alerts if no announcements exist
      if (mapped.length === 0) {
        setNotifications([
          { id: 'm1', type: 'opportunity', title: 'Market Sentiment Bullish', message: 'Gemini AI detects strong buy pressure on Nifty 50 constituents.', time: 'Just now', read: false },
          { id: 'm2', type: 'risk', title: 'Volatility Warning', message: 'Global tech stocks are showing signs of exhaustion. Consider protective stops.', time: '1h ago', read: false }
        ]);
      } else {
        setNotifications(mapped.sort((a, b) => b.date - a.date));
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = (e) => {
    e.stopPropagation();
    const allIds = notifications.map(n => n.id);
    saveReadStatus(allIds);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    const currentRead = getReadStatus();
    if (!currentRead.includes(id)) {
      const newRead = [...currentRead, id];
      saveReadStatus(newRead);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const removeNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
    // Optional: Also mark as read when removed
    markAsRead(id);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200 relative group"
        title="AI Alerts"
      >
        <svg className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white rounded-[32px] border border-slate-200 shadow-2xl z-50 overflow-hidden"
            >
              <div className="bg-slate-900 px-6 py-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <h3 className="text-white text-[11px] font-black uppercase tracking-widest">AI Intelligence Terminal</h3>
                </div>
                <div className="flex items-center gap-4">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Mark all read</button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                {loading && notifications.length === 0 ? (
                  <div className="p-12 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decrypting Signals...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No Intelligence Feeds</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`p-6 hover:bg-slate-50 transition-all relative group cursor-pointer ${!n.read ? 'bg-indigo-50/20' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              n.type === 'danger' || n.type === 'risk' ? 'bg-rose-500' : 
                              n.type === 'success' || n.type === 'opportunity' ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              n.type === 'danger' || n.type === 'risk' ? 'text-rose-600' : 
                              n.type === 'success' || n.type === 'opportunity' ? 'text-emerald-600' : 'text-indigo-600'
                            }`}>
                              {n.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{n.time}</span>
                            <button 
                              onClick={(e) => removeNotification(e, n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-md transition-all text-slate-400"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mb-1 tracking-tight">{n.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed pr-6">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                >
                  Close Terminal
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

