import { useEffect, useState } from "react";

function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const icons = {
    success: (
      <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    error: (
      <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    info: (
      <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  };

  return (
    <div 
      className={`min-w-[320px] max-w-md bg-white border border-slate-100 p-5 rounded-[28px] shadow-2xl shadow-slate-200 flex items-center gap-5 transition-all duration-500 transform ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
      }`}
    >
      {icons[type] || icons.info}
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{type}</p>
        <p className="text-slate-900 font-black tracking-tight leading-tight">{message}</p>
      </div>
      <button 
        onClick={handleClose}
        className="text-slate-300 hover:text-slate-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default Toast;
