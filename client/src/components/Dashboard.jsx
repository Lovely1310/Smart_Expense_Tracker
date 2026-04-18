import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LogOut, Plus, Trash2, CheckCircle, Download, Upload, TrendingUp, Search, FileText, X, IndianRupee, LayoutGrid, AlertCircle } from 'lucide-react';

const Dashboard = ({ user, setToken }) => {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('Unsold Car');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ regNo: '', carDetails: '', credit: 0, debit: 0, paidBy: '', description: '' });

  const API_URL = 'https://ideal-fishstick-r4rw7ww5pjv43p7xv-5000.app.github.dev';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/expenses/all`);
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  // --- IMPROVED EXCEL IMPORT LOGIC ---
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        if (data.length === 0) {
            alert("Excel file is empty!");
            setLoading(false);
            return;
        }

        // Smart Mapping: Excel Header names can be different
        const formattedData = data.map(row => ({
          regNo: row['Reg No'] || row['regNo'] || row['Registration'] || '',
          carDetails: row['Car Details'] || row['carDetails'] || row['Details'] || '',
          credit: Number(row['Credit'] || row['Income'] || row['credit'] || 0),
          debit: Number(row['Debit'] || row['Expense'] || row['debit'] || 0),
          paidBy: row['Paid By'] || row['paidBy'] || user.name,
          description: row['Description'] || row['Note'] || '',
          category: activeTab
        }));

        // Sending bulk data
        await Promise.all(formattedData.map(item => axios.post(`${API_URL}/api/expenses/add`, item)));
        
        alert(`Successfully imported ${formattedData.length} records!`);
        fetchData();
      } catch (err) {
        alert("Import failed. Check Excel format.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const filtered = expenses.filter(e => e.category === activeTab);
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);
    XLSX.writeFile(wb, `${activeTab}_Report.xlsx`);
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

  const handleAction = async (id, action) => {
    try {
      if (action === 'sold') await axios.put(`${API_URL}/api/expenses/update/${id}`, { category: 'Sold Car' });
      else await axios.delete(`${API_URL}/api/expenses/delete/${id}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // --- ANALYSIS LOGIC ---
  const filteredData = expenses.filter(e => 
    e.category === activeTab && 
    (e.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) || e.carDetails?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCredit = filteredData.reduce((a, b) => a + Number(b.credit || 0), 0);
  const totalDebit = filteredData.reduce((a, b) => a + Number(b.debit || 0), 0);

  // Grouping for Per-Car Analysis
  const carSummary = expenses.reduce((acc, curr) => {
    if (!curr.regNo) return acc;
    const key = curr.regNo.toUpperCase();
    if (!acc[key]) acc[key] = { reg: key, profit: 0, details: curr.carDetails };
    acc[key].profit += (Number(curr.credit) - Number(curr.debit));
    return acc;
  }, {});

  const sortedCars = Object.values(carSummary).sort((a,b) => b.profit - a.profit).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col h-screen sticky top-0 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-2xl font-bold tracking-tight text-purple-400 italic">
            DEER <span className="text-white not-italic">AUTO</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Enterprise Management</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {['Unsold Car', 'Sold Car', 'Office Spending', 'SBI Spending', 'TP Expense'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-semibold text-[14px] flex items-center gap-4 ${activeTab === tab ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
               <LayoutGrid size={18}/> {tab}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
           <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full p-4 text-red-400 font-bold text-sm flex items-center gap-3 hover:bg-red-500/10 rounded-2xl transition-all">
             <LogOut size={18}/> Logout Account
           </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">{activeTab}</h2>
            <p className="text-slate-500 font-medium mt-1">Session active for <span className="text-purple-600 font-bold">{user?.name}</span></p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:shadow-md transition-all">
              <Download size={18}/> Export
            </button>
            <label className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:shadow-md cursor-pointer transition-all">
              <Upload size={18}/> {loading ? 'Importing...' : 'Import'}
              <input type="file" onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
            </label>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-purple-600 shadow-xl transition-all">
              <Plus size={18}/> New Entry
            </button>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <SummaryCard title="Category Income" value={totalCredit} color="text-green-600" border="border-green-500" />
          <SummaryCard title="Category Expense" value={totalDebit} color="text-red-600" border="border-red-500" />
          <SummaryCard title="Net Balance" value={totalCredit - totalDebit} color="text-purple-600" border="border-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEDGER TABLE */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="relative w-80">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                  <input type="text" placeholder="Search by Reg No or Car..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-200 transition-all" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Ledger View</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50/50 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                     <th className="px-8 py-5">Unit Details</th>
                     <th className="px-8 py-5 text-center">Amount</th>
                     <th className="px-8 py-5 text-center">Paid By</th>
                     <th className="px-8 py-5 text-center">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredData.map(item => (
                     <tr key={item._id} className="hover:bg-purple-50/20 transition-all group">
                       <td className="px-8 py-6">
                         <div className="text-base font-bold text-slate-900 uppercase">{item.regNo || 'General'}</div>
                         <div className="text-sm text-slate-500 font-medium">{item.carDetails || item.description}</div>
                       </td>
                       <td className="px-8 py-6 text-center">
                         <div className="text-green-600 font-bold text-base">₹{item.credit}</div>
                         <div className="text-red-400 font-bold text-xs">₹{item.debit}</div>
                       </td>
                       <td className="px-8 py-6 text-center">
                         <span className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 uppercase">{item.paidBy}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                             {activeTab === 'Unsold Car' && (
                               <button onClick={() => handleAction(item._id, 'sold')} className="p-2 text-green-500 bg-green-50 rounded-xl hover:bg-green-500 hover:text-white transition-all"><CheckCircle size={20}/></button>
                             )}
                             <button onClick={() => handleAction(item._id, 'delete')} className="p-2 text-red-400 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                          </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {filteredData.length === 0 && <div className="p-20 text-center text-slate-400 font-medium italic">No records found. Click 'New Entry' or 'Import' to add data.</div>}
             </div>
          </div>

          {/* ADVANCED ANALYTICS SIDEBAR */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-900 mb-6">Unit Performance</h3>
               <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{name:'Income', value:totalCredit||1}, {name:'Expense', value:totalDebit||1}]} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                         <Cell fill="#8B5CF6" /> <Cell fill="#E2E8F0" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-8 space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Top Profitable Units</p>
                  {sortedCars.map((car, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-sm uppercase">{car.reg}</span>
                      <span className={`font-bold text-sm ${car.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>₹{car.profit}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-3xl font-extrabold text-slate-900 uppercase italic mb-8">New Ledger Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Reg No / ID" onChange={(e)=>setFormData({...formData, regNo: e.target.value})} required uppercase />
                <InputField label="Car Details" onChange={(e)=>setFormData({...formData, carDetails: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Income (Credit)" type="number" color="text-green-600" onChange={(e)=>setFormData({...formData, credit: Number(e.target.value)})} />
                <InputField label="Expense (Debit)" type="number" color="text-red-600" onChange={(e)=>setFormData({...formData, debit: Number(e.target.value)})} />
              </div>
              <InputField label="Paid By" onChange={(e)=>setFormData({...formData, paidBy: e.target.value})} required />
              <textarea placeholder="Description / Note..." className="w-full p-5 bg-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-purple-100 min-h-[100px]" onChange={(e)=>setFormData({...formData, description: e.target.value})}></textarea>
              <button className="w-full bg-slate-900 text-white font-black p-5 rounded-3xl text-base uppercase tracking-widest hover:bg-purple-600 shadow-2xl transition-all">Save to Ledger</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, color, border }) => (
  <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-t-8 ${border} flex flex-col group hover:shadow-xl transition-all`}>
    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</span>
    <span className={`text-3xl font-black tracking-tighter ${color}`}>₹{value.toLocaleString()}</span>
  </div>
);

const InputField = ({ label, type="text", color="text-slate-900", uppercase=false, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} className={`p-4 bg-slate-100 rounded-2xl outline-none font-bold text-base ${color} ${uppercase ? 'uppercase' : ''} focus:ring-4 focus:ring-purple-100 transition-all`} {...props} />
  </div>
);

export default Dashboard;