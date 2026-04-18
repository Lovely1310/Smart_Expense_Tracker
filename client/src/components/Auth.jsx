import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ setToken, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', businessName: '' });

  // ⚠️ Har baar login se pehle check karein ki port 5000 PUBLIC hai ya nahi
  const API_URL = 'https://ideal-fishstick-r4rw7ww5pjv43p7xv-5000.app.github.dev';

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
        alert("Account Created! Login Now.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Connection Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden border border-purple-500/20">
        <div className="md:w-1/2 bg-gradient-to-br from-purple-700 via-violet-800 to-black p-12 text-white flex flex-col justify-center">
          <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300">Smart Ledger</h1>
          <p className="text-purple-100 mb-8 font-light italic">Universal Financial Tracking & Analytics.</p>
          <div className="space-y-3 text-sm">
             <div className="bg-white/10 p-4 rounded-2xl border border-white/5 shadow-lg">✨ Business & Personal Category Isolation</div>
             <div className="bg-white/10 p-4 rounded-2xl border border-white/5 shadow-lg">📊 Dynamic Doughnut Charts</div>
          </div>
        </div>
        <div className="md:w-1/2 p-12 bg-white flex flex-col justify-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">{isLogin ? 'Welcome' : 'Join Pro'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-semibold" onChange={(e) => setFormData({...formData, name: e.target.value})} required/>
                <input type="text" placeholder="Workspace/Company Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-semibold italic" onChange={(e) => setFormData({...formData, businessName: e.target.value})} required/>
              </>
            )}
            <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-semibold" onChange={(e) => setFormData({...formData, email: e.target.value})} required/>
            <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-semibold" onChange={(e) => setFormData({...formData, password: e.target.value})} required/>
            <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-lg hover:bg-purple-700 transition-all mt-4 uppercase tracking-widest shadow-2xl shadow-purple-200">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-slate-400 font-bold text-sm hover:text-purple-600 underline underline-offset-4">
            {isLogin ? "Need an account? Sign Up" : "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;