function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

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
               <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                  Update Profile
               </button>
               <button className="bg-slate-50 text-slate-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
                  Security Settings
               </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Member since {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;