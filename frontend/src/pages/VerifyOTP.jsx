import { useState, useEffect, useRef } from "react";
import { verifyOTP, resendOTP } from "../api/auth.js";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function VerifyOTP() {
  const { addToast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const email = sessionStorage.getItem("reset_email");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, idx) => {
      newOtp[idx] = char;
      if (inputRefs.current[idx]) {
        inputRefs.current[idx].value = char;
      }
    });
    setOtp(newOtp);
    if (inputRefs.current[data.length - 1]) {
      inputRefs.current[data.length - 1].focus();
    }
  };

  async function handleVerify(e) {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      addToast("Please enter all 6 digits", "error");
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otpString);
      addToast("OTP verified successfully!", "success");
      sessionStorage.setItem("reset_otp", otpString);
      navigate("/reset-password");
    } catch (error) {
      addToast(error.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;
    setLoading(true);
    try {
      await resendOTP(email);
      addToast("A new OTP has been sent to your email", "success");
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } catch (error) {
      addToast("Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 rounded-[24px] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Security Check</h2>
          <p className="text-slate-500 text-sm font-medium mt-3">We've sent a verification code to</p>
          <p className="text-slate-900 font-bold text-sm">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl text-center text-2xl font-black text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Verify & Continue"}
          </button>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors underline underline-offset-4"
              >
                Resend Verification Code
              </button>
            ) : (
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Resend code in <span className="text-indigo-600 font-bold">{timer}s</span>
              </p>
            )}
          </div>

          <p className="text-center">
            <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              Wrong email? Change address
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
