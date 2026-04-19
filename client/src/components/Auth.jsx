import React, { useState } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Building2, ArrowRight, ShieldCheck, PieChart, Layers } from 'lucide-react';

const Auth = ({ setToken, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', businessName: '' });

  const API_URL = 'https://ideal-fishstick-r4rw7ww5pjv43p7xv-5000.app.github.dev';

  // --- REAL GOOGLE LOGIN LOGIC ---
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Google se 'Access Token' milta hai, use backend bhejna hai
        const res = await axios.post(`${API_URL}/api/auth/google-login`, {
          token: response.access_token
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
      } catch (err) {
        alert("Google Authentication Failed on Server");
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
      } else {
        alert("Account Created! Please Login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 font-sans antialiased text-slate-900">
      <div className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row max-w-6xl w-full overflow-hidden relative z-10 border border-white/5">
        
        {/* LEFT SIDE */}
        <div className="md:w-[42%] bg-[#0d0d0f] p-12 lg:p-16 text-white flex flex-col justify-between relative border-r border-white/5">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-extrabold tracking-widest mb-12 uppercase">
              <ShieldCheck size={14} /> Enterprise Node 01
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-8 tracking-tighter uppercase italic">
              Expense <br/><span className="text-purple-500">Intelligence</span><br/>System
            </h1>
            <div className="space-y-10">
              <div className="flex gap-5">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 h-fit"><Layers className="text-purple-400" /></div>
                <div>
                  <h3 className="text-lg font-bold uppercase italic">Real-time Insights</h3>
                  <p className="text-slate-500 text-sm">Automated categorization for high-fidelity ledgers.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-700 tracking-[0.4em] uppercase italic">Precision • Scale • Elite</div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-[58%] p-12 lg:p-20 bg-white flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Establish Session</h2>
            <p className="text-slate-400 text-sm font-semibold">Establishing secure connection to global ledger...</p>
          </div>

          {/* REAL GOOGLE BUTTON */}
          <button 
            onClick={() => loginWithGoogle()}
            className="flex items-center justify-center gap-4 w-full py-5 border-2 border-slate-100 rounded-2xl hover:border-purple-200 hover:bg-purple-50/20 transition-all duration-300 group shadow-sm active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            <span className="text-sm font-bold text-slate-700 tracking-tight">Access with Google Credentials</span>
          </button>

          <div className="relative flex items-center my-10">
             <div className="flex-grow border-t border-slate-100"></div>
             <span className="mx-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Manual Node Access</span>
             <div className="flex-grow border-t border-slate-100"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-5 animate-in slide-in-from-top-2">
                <Input icon={<User size={18}/>} placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input icon={<Building2 size={18}/>} placeholder="Entity" onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
              </div>
            )}
            <Input icon={<Mail size={18}/>} type="email" placeholder="Email Address" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input icon={<Lock size={18}/>} type="password" placeholder="Key Phrase" onChange={(e) => setFormData({...formData, password: e.target.value})} />
            
            <button className="w-full bg-[#0a0a0c] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-purple-600 hover:shadow-2xl transition-all duration-500 mt-6 group">
              Establish Session <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform"/>
            </button>
          </form>
          
          <button onClick={() => setIsLogin(!isLogin)} className="mt-12 w-full text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:text-purple-600 transition-all border-b border-transparent hover:border-purple-100 pb-1">
            {isLogin ? "System request: New account?" : "Return to core node"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors">
      {icon}
    </div>
    <input {...props} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50/50 transition-all shadow-sm" required />
  </div>
);

export default Auth;