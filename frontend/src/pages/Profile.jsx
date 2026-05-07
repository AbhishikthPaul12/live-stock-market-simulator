import { useState } from "react";
import { updateProfile } from "../api/auth.js";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile({ name: editName, email: editEmail });
      setUser(updated);
      setShowProfileModal(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Profile</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg italic opacity-80">Manage your identity and financial configuration.</p>
        </header>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 h-32 relative">
             <div className="absolute -bottom-12 left-10 w-24 h-24 bg-white rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-indigo-600">
                {user?.name?.[0] || 'U'}
             </div>
          </div>
          
          <div className="p-10 pt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Account Holder</label>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{user?.name || 'Anonymous User'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                  <p className="text-lg font-bold text-slate-600">{user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col justify-center">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Available Liquidity</label>
                 <p className="text-4xl font-black text-indigo-600 font-mono tracking-tighter">
                    ₹{(user?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                 </p>
                 <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Funds</span>
                 </div>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-100 flex gap-4">
               <button 
                onClick={() => setShowProfileModal(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
               >
                  Update Profile
               </button>
               <button 
                onClick={() => setShowSecurityModal(true)}
                className="bg-slate-50 text-slate-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
               >
                  Security Settings
               </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Member since {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Update Profile</h2>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Security Modal (Reduces to Forgot Password flow) */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-4">Security Access</h2>
              <p className="text-slate-500 text-sm font-medium mb-8">
                To change your password, you must initiate the security reset protocol from the login screen. This ensures multi-factor validation.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    localStorage.removeItem("user");
                    navigate("/forgot-password");
                  }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Logout & Reset Password
                </button>
                <button 
                  onClick={() => setShowSecurityModal(false)}
                  className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Keep Current Security
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;