import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LogOut, Plus, Trash2, CheckCircle, Download, Upload, Search, X, IndianRupee, LayoutGrid, BarChart3, TrendingUp } from 'lucide-react';

const Dashboard = ({ user, setToken }) => {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('Unsold Car');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ regNo: '', carDetails: '', credit: 0, debit: 0, paidBy: '', description: '' });

  const API_URL = 'https://ideal-fishstick-r4rw7ww5pjv43p7xv-5000.app.github.dev';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/expenses/all`);
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("API Error:", err); }
  };

  // --- POWERFUL SEARCH & FILTER ENGINE ---
  const filteredData = useMemo(() => {
    return expenses.filter(e => 
      e.category === activeTab && 
      (
        e.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.carDetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.paidBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [expenses, activeTab, searchTerm]);

  // --- ADVANCED ANALYTICS (REAL-TIME) ---
  const stats = useMemo(() => {
    const income = filteredData.reduce((a, b) => a + Number(b.credit || 0), 0);
    const expense = filteredData.reduce((a, b) => a + Number(b.debit || 0), 0);
    
    // Grouping logic for Top Profitable Units
    const unitMap = filteredData.reduce((acc, curr) => {
      const key = curr.regNo?.toUpperCase() || 'GENERAL';
      if (!acc[key]) acc[key] = { name: key, profit: 0 };
      acc[key].profit += (Number(curr.credit) - Number(curr.debit));
      return acc;
    }, {});

    const topUnits = Object.values(unitMap).sort((a,b) => b.profit - a.profit).slice(0, 3);

    return { income, expense, balance: income - expense, topUnits };
  }, [filteredData]);

  const COLORS = ['#8b5cf6', '#1e293b']; // Lavender & Black

  // --- HANDLERS ---
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial_Report");
    XLSX.writeFile(wb, `Deer_Automobiles_${activeTab}.xlsx`);
  };

  const handleAction = async (id, action) => {
    if (action === 'sold') await axios.put(`${API_URL}/api/expenses/update/${id}`, { category: 'Sold Car' });
    else if (action === 'delete') await axios.delete(`${API_URL}/api/expenses/delete/${id}`);
    fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/expenses/add`, { ...formData, category: activeTab });
      setShowModal(false);
      setFormData({ regNo: '', carDetails: '', credit: 0, debit: 0, paidBy: '', description: '' });
      fetchData();
    } catch (err) { alert("Save Failed"); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-900">
      
      {/* SIDEBAR - DEEP NAVY / BLACK */}
      <aside className="w-72 bg-[#020617] text-white flex flex-col h-screen sticky top-0 shrink-0 shadow-2xl">
        <div className="p-10 border-b border-white/5">
          <h1 className="text-2xl font-black italic tracking-tight text-purple-500 leading-none">
            DEER <br/> <span className="text-white not-italic uppercase font-extrabold tracking-normal">AUTOMOBILES</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold mt-3 tracking-widest uppercase italic">Enterprise Intelligence</p>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-2">
          {['Unsold Car', 'Sold Car', 'Office Spending', 'SBI Spending', 'TP Expense'].map(tab => (
            <button key={tab} onClick={() => {setActiveTab(tab); setSearchTerm('');}} 
            className={`w-full text-left p-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-4 ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
               <LayoutGrid size={18}/> {tab}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
           <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full p-4 text-red-400 font-bold text-[11px] tracking-widest flex items-center gap-3 hover:bg-red-500/10 rounded-2xl transition-all uppercase">
             <LogOut size={16}/> Terminate Session
           </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD AREA */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* HEADER AREA */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase leading-none italic">{activeTab}</h2>
            <div className="flex items-center gap-4 mt-4">
               <span className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                 <TrendingUp size={12}/> Secure Protocol
               </span>
               <p className="text-slate-400 font-bold text-xs uppercase">Operator: <span className="text-slate-900">{user?.name}</span></p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={exportExcel} className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[11px] text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
              <Download size={16}/> Intel Export
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-xs hover:bg-purple-600 shadow-2xl transition-all uppercase tracking-widest">
              <Plus size={20}/> New Entry
            </button>
          </div>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <MetricCard title="Filtered Credit" value={stats.income} color="text-green-600" border="border-green-500" sub="Total Inflow" />
          <MetricCard title="Filtered Debit" value={stats.expense} color="text-red-500" border="border-red-500" sub="Total Outflow" />
          <MetricCard title="Net Yield" value={stats.balance} color="text-purple-600" border="border-purple-600" sub="Profit/Loss Analysis" />
        </div>

        {/* DATA GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          
          {/* EXCEL STYLE TABLE */}
          <div className="xl:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <div className="p-8 border-b border-slate-100 flex items-center bg-slate-50/20">
                <div className="relative w-full max-w-lg">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                   <input 
                      type="text" 
                      placeholder="Filter by Registration, Details or Operator (Paid By)..." 
                      className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:border-purple-200 focus:ring-4 focus:ring-purple-50 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>

             <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-8 py-6">REG. NO.</th>
                      <th className="px-8 py-6">CAR_DETAILS</th>
                      <th className="px-8 py-6 text-center">CREDIT (INCOME)</th>
                      <th className="px-8 py-6 text-center">DEBIT (EXPENSE)</th>
                      <th className="px-8 py-6 text-center">PAID BY</th>
                      <th className="px-8 py-6 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredData.map(item => (
                      <tr key={item._id} className="hover:bg-purple-50/30 transition-all group">
                        <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase group-hover:text-purple-600">{item.regNo || '---'}</td>
                        <td className="px-8 py-6 font-bold text-slate-500 text-xs uppercase">{item.carDetails || item.description}</td>
                        <td className="px-8 py-6 text-center text-green-600 font-black text-base">₹{item.credit}</td>
                        <td className="px-8 py-6 text-center text-red-500 font-black text-base">₹{item.debit}</td>
                        <td className="px-8 py-6 text-center">
                           <span className="bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-wider">{item.paidBy}</span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              {activeTab === 'Unsold Car' && (
                                <button onClick={() => handleAction(item._id, 'sold')} className="p-3 text-green-500 bg-green-50 rounded-2xl hover:bg-green-500 hover:text-white transition-all"><CheckCircle size={18}/></button>
                              )}
                              <button onClick={() => handleAction(item._id, 'delete')} className="p-3 text-red-400 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredData.length === 0 && (
                  <div className="p-24 text-center text-slate-400 font-bold italic">No matching intelligence found. Adjust filters.</div>
                )}
             </div>
          </div>

          {/* SIDEBAR ANALYTICS */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10 text-center">Insight Distribution</h3>
               <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{name:'Credit', value:stats.income||1}, {name:'Debit', value:stats.expense||1}]} innerRadius={65} outerRadius={95} paddingAngle={10} dataKey="value">
                         <Cell fill="#8B5CF6" stroke="none" /> 
                         <Cell fill="#F1F5F9" stroke="none" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-10 space-y-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center border-b pb-4">Top Unit Yields</p>
                  {stats.topUnits.map((unit, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-5 rounded-3xl group hover:bg-slate-100 transition-all">
                       <span className="font-black text-xs uppercase text-slate-500">{unit.name}</span>
                       <span className={`font-black text-sm ${unit.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>₹{unit.profit.toLocaleString()}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </main>

      {/* NEW ENTRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 relative animate-in zoom-in duration-300">
             <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-red-500 transition-all"><X size={28}/></button>
             <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-10 border-b pb-6">Secure Entry Protocol</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                   <AdvancedInput label="REG. NO." placeholder="E.G. HR26..." onChange={(e)=>setFormData({...formData, regNo: e.target.value})} required uppercase />
                   <AdvancedInput label="CAR_DETAILS" placeholder="UNIT SPECS" onChange={(e)=>setFormData({...formData, carDetails: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <AdvancedInput label="CREDIT (INCOME)" type="number" color="text-green-600" bg="bg-green-50/30" border="border-green-100" onChange={(e)=>setFormData({...formData, credit: Number(e.target.value)})} />
                   <AdvancedInput label="DEBIT (EXPENSE)" type="number" color="text-red-600" bg="bg-red-50/30" border="border-red-100" onChange={(e)=>setFormData({...formData, debit: Number(e.target.value)})} />
                </div>
                <AdvancedInput label="PAID BY (OPERATOR)" placeholder="ENTER NAME" onChange={(e)=>setFormData({...formData, paidBy: e.target.value})} required />
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">DESCRIPTION / NOTES</label>
                   <textarea placeholder="LOG ENTRY DETAILS..." className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:border-purple-200 transition-all min-h-[100px]" onChange={(e)=>setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <button className="w-full bg-slate-950 text-white font-black p-6 rounded-[2rem] text-sm uppercase tracking-widest hover:bg-purple-600 shadow-2xl transition-all transform active:scale-95 mt-4">Commit Log Entry</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ELITE UI COMPONENTS ---

const MetricCard = ({ title, value, color, border, sub }) => (
  <div className={`bg-white p-8 rounded-[3rem] shadow-sm border-t-[10px] ${border} hover:shadow-xl transition-all transform hover:-translate-y-1`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
    <div className="flex items-end justify-between">
       <span className={`text-4xl font-black tracking-tighter ${color}`}>₹{value.toLocaleString()}</span>
       <span className="text-[9px] font-black text-slate-300 uppercase italic">{sub}</span>
    </div>
  </div>
);

const AdvancedInput = ({ label, type="text", color="text-slate-800", bg="bg-slate-50", border="border-transparent", uppercase=false, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
    <input 
      type={type} 
      className={`w-full p-5 ${bg} border-2 ${border} rounded-[1.5rem] outline-none font-bold text-sm ${color} ${uppercase ? 'uppercase' : ''} focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 transition-all`}
      {...props} 
    />
  </div>
);

export default Dashboard;