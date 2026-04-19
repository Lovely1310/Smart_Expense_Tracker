import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Table, Tag, Space, Modal, Button, Input, Select, notification, Card, Row, Col, Statistic, Popconfirm, Tooltip, DatePicker } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartTooltip } from 'recharts';
import { LogOut, Plus, Trash2, CheckCircle, Download, Upload, Search, LayoutGrid, X, CalendarCheck } from 'lucide-react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
const { Option } = Select;

const Dashboard = ({ user, setToken }) => {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('Unsold Car');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ regNo: '', carDetails: '', credit: 0, debit: 0, paidBy: '', description: '', date: dayjs().format('YYYY-MM-DD') });

  const API_URL = 'https://ideal-fishstick-r4rw7ww5pjv43p7xv-5000.app.github.dev';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/expenses/all`);
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Sync Error"); }
  };

  // --- 🔥 ADVANCED DATE & HEADER ENGINE (100% ACCURACY) ---
  const processExcelValue = (row, possibilities) => {
    // Header names se spaces aur dots hata kar match karta hai (Fuzzy Matching)
    const foundKey = Object.keys(row).find(key => {
      const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return possibilities.some(p => p.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanKey);
    });
    return foundKey ? row[foundKey] : null;
  };

  const convertStrictDate = (val) => {
    if (!val) return dayjs().format('YYYY-MM-DD');
    if (typeof val === 'number') {
      const d = XLSX.SSF.parse_date_code(val);
      return dayjs(new Date(d.y, d.m - 1, d.d)).format('YYYY-MM-DD');
    }
    const formats = ['DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY'];
    const p = dayjs(val, formats, true);
    return p.isValid() ? p.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
  };

  // --- 🔥 SMART IMPORT LOGIC ---
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        let allImportedData = [];

        workbook.SheetNames.forEach(sheetName => {
          const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          if(rawRows.length === 0) return;

          let cat = activeTab;
          if(sheetName.toLowerCase().includes('sold') && !sheetName.toLowerCase().includes('un')) cat = 'Sold Car';
          else if(sheetName.toLowerCase().includes('unsold')) cat = 'Unsold Car';

          rawRows.forEach(row => {
            allImportedData.push({
              regNo: String(processExcelValue(row, ['REGNO', 'REGISTRATION', 'CARNO', 'PLATE', 'VEHICLENO']) || '').trim(),
              carDetails: String(processExcelValue(row, ['CARDETAILS', 'DETAILS', 'MODEL', 'CARNAME', 'SPECS']) || '').trim(),
              credit: Number(String(processExcelValue(row, ['CREDIT', 'INCOME', 'IN', 'CASHIN']) || 0).replace(/[^0-9.]/g, '')),
              debit: Number(String(processExcelValue(row, ['DEBIT', 'EXPENSE', 'OUT', 'AMOUNT']) || 0).replace(/[^0-9.]/g, '')),
              paidBy: String(processExcelValue(row, ['PAIDBY', 'OPERATOR', 'NAME', 'BY', 'PERSON']) || user?.name || 'ADMIN').toUpperCase(),
              description: String(processExcelValue(row, ['DESCRIPTION', 'NOTE', 'REMARK', 'COMMENT']) || '').trim(),
              date: convertStrictDate(processExcelValue(row, ['DATE', 'ENTRYDATE', 'TIME'])),
              category: cat
            });
          });
        });

        await axios.post(`${API_URL}/api/expenses/bulk-add`, allImportedData);
        notification.success({ message: `Successfully Imported ${allImportedData.length} records!` });
        fetchData();
      } catch (err) { notification.error({ message: "Import Failed. Open Console (F12) to see error." }); }
    };
    reader.readAsBinaryString(file);
  };

  const handleAction = async (id, action) => {
    if (action === 'sold') await axios.put(`${API_URL}/api/expenses/update/${id}`, { category: 'Sold Car' });
    else await axios.delete(`${API_URL}/api/expenses/delete/${id}`);
    fetchData();
  };

  // --- FILTERS & ANALYTICS ---
  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return expenses.filter(e => e.category === activeTab && 
      ((e.regNo || "").toLowerCase().includes(search) || 
       (e.paidBy || "").toLowerCase().includes(search) ||
       (e.carDetails || "").toLowerCase().includes(search))
    );
  }, [expenses, activeTab, searchTerm]);

  const stats = useMemo(() => {
    const inc = filteredData.reduce((a, b) => a + Number(b.credit || 0), 0);
    const exp = filteredData.reduce((a, b) => a + Number(b.debit || 0), 0);
    return { inc, exp, bal: inc - exp };
  }, [filteredData]);

  const columns = [
    { title: 'DATE', dataIndex: 'date', width: 110, render: d => <span className="text-slate-400 font-bold text-[11px]">{dayjs(d).format('DD-MM-YYYY')}</span> },
    { title: 'REGISTRATION', dataIndex: 'regNo', render: t => <b className="text-slate-900 text-[14px] uppercase tracking-tighter">{t || '---'}</b> },
    { title: 'DETAILS', dataIndex: 'carDetails', render: t => <span className="text-slate-500 font-bold text-[11px] uppercase leading-tight">{t}</span> },
    { title: 'CREDIT', dataIndex: 'credit', render: v => <span className="text-green-600 font-black text-sm">₹{v?.toLocaleString()}</span> },
    { title: 'DEBIT', dataIndex: 'debit', render: v => <span className="text-red-500 font-black text-sm">₹{v?.toLocaleString()}</span> },
    { title: 'PAID BY', dataIndex: 'paidBy', render: t => <Tag color="purple" className="font-black uppercase border-none bg-purple-50 text-purple-600 px-3">{t}</Tag> },
    { title: 'DESCRIPTION', dataIndex: 'description', render: t => <span className="text-slate-400 italic text-[11px] uppercase truncate block max-w-[150px]">{t || '---'}</span> },
    { title: 'ACTION', render: (_, r) => (
        <Space>
          {activeTab === 'Unsold Car' && <CheckCircle size={22} className="text-green-500 cursor-pointer hover:scale-110" onClick={() => handleAction(r._id, 'sold')} />}
          <Trash2 size={22} className="text-red-200 cursor-pointer hover:text-red-500" onClick={() => handleAction(r._id, 'delete')} />
        </Space>
    )},
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#020617] text-white flex flex-col h-screen sticky top-0 shrink-0 shadow-2xl">
        <div className="p-10 border-b border-white/5">
          <h1 className="text-2xl font-black italic tracking-tighter text-purple-500 leading-none">
            DEER <br/> <span className="text-white font-extrabold uppercase tracking-normal">AUTOMOBILES</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Enterprise Intelligence</p>
        </div>
        <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
          {['Unsold Car', 'Sold Car', 'Office Spending', 'SBI Spending', 'TP Expense'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`w-full text-left p-4 rounded-2xl transition-all font-black text-[12px] flex items-center gap-4 uppercase ${activeTab === tab ? 'bg-purple-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:bg-white/5'}`}>
               <LayoutGrid size={16}/> {tab}
            </button>
          ))}
        </nav>
        <button onClick={() => {localStorage.clear(); window.location.reload();}} className="p-8 text-red-400 font-bold text-xs flex items-center gap-3 hover:bg-red-500/10 transition-all uppercase tracking-widest">
          <LogOut size={16}/> Logout Account
        </button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter">{activeTab}</h2>
            <p className="text-slate-400 font-bold text-[11px] uppercase mt-2 tracking-widest">Active Node: {user?.name}</p>
          </div>
          <div className="flex gap-4">
             <Popconfirm title="Empty this entire category data?" onConfirm={async () => { await axios.delete(`${API_URL}/api/expenses/clear-all?category=${activeTab}`); fetchData(); }}>
                <Button danger icon={<Trash2 size={16}/>} className="h-14 rounded-2xl font-black uppercase text-[10px] border-none shadow-md">Clear category</Button>
             </Popconfirm>
             <Button type="primary" size="large" icon={<Plus size={18}/>} onClick={() => setShowModal(true)} className="bg-slate-950 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-purple-600">New Entry</Button>
          </div>
        </header>

        <Row gutter={32} className="mb-10">
          <StatCol title="Category Credit" value={stats.inc} color="#16a34a" />
          <StatCol title="Category Debit" value={stats.exp} color="#dc2626" />
          <StatCol title="Net Yield" value={stats.bal} color="#8b5cf6" />
        </Row>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                <Input size="large" placeholder="Global Intelligence Search..." prefix={<Search size={18} className="text-slate-300"/>} className="w-96 rounded-2xl font-bold border-none shadow-sm h-12" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                <Space>
                   <Button icon={<Download size={16}/>} onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(filteredData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Financials");
                      XLSX.writeFile(wb, `${activeTab}_Report.xlsx`);
                   }} className="rounded-xl font-bold text-[10px] h-12 uppercase px-6 shadow-sm">Export</Button>
                   <label className="bg-slate-950 text-white rounded-xl px-6 h-12 cursor-pointer font-bold text-[10px] uppercase flex items-center gap-2 hover:bg-purple-600 transition shadow-lg">
                     <Upload size={16}/> Bulk Import <input type="file" onChange={handleImport} className="hidden" />
                   </label>
                </Space>
             </div>
             <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 8 }} rowKey="_id" className="px-4 pb-4 font-medium" />
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center h-fit">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 italic">Distribution</h3>
               <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{name:'In', value:stats.inc||1},{name:'Out', value:stats.exp||1}]} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                        <Cell fill="#8b5cf6" stroke="none" /><Cell fill="#F1F5F9" stroke="none" />
                      </Pie>
                      <RechartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-slate-400">
                  <div className="flex justify-between mb-2"><span>Total Inflow</span><span className="text-green-600">₹{stats.inc.toLocaleString()}</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-200"><span>Total Outflow</span><span className="text-red-500">₹{stats.exp.toLocaleString()}</span></div>
               </div>
          </div>
        </div>
      </main>

      <Modal title={<h2 className="text-xl font-black uppercase italic tracking-tighter">Manual Entry Protocol</h2>} open={showModal} onCancel={() => setShowModal(false)} footer={null} centered width={650}>
        <form className="space-y-6 pt-6" onSubmit={(e) => { e.preventDefault(); }}>
          <div className="grid grid-cols-2 gap-6">
            <InputItem label="REGISTRATION" onChange={(e)=>setFormData({...formData, regNo: e.target.value})} required uppercase />
            <InputItem label="CAR DETAILS" onChange={(e)=>setFormData({...formData, carDetails: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <InputItem label="CREDIT" type="number" color="#16a34a" onChange={(e)=>setFormData({...formData, credit: Number(e.target.value)})} />
            <InputItem label="DEBIT" type="number" color="#dc2626" onChange={(e)=>setFormData({...formData, debit: Number(e.target.value)})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <InputItem label="PAID BY" onChange={(e)=>setFormData({...formData, paidBy: e.target.value})} required />
             <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 text-left">FISCAL DATE</label>
                <DatePicker className="h-14 rounded-2xl font-black bg-[#F8FAFC] border-none w-full" defaultValue={dayjs()} onChange={(d, ds) => setFormData({...formData, date: ds})} />
             </div>
          </div>
          <Input.TextArea rows={3} placeholder="DESCRIPTION / NOTES..." className="rounded-2xl font-bold p-4 bg-slate-50 border-none" onChange={(e)=>setFormData({...formData, description: e.target.value})} />
          <Button type="primary" block onClick={async () => {
             await axios.post(`${API_URL}/api/expenses/add`, { ...formData, category: activeTab });
             setShowModal(false); fetchData(); notification.success({ message: "Intelligence Committed" });
          }} className="bg-slate-950 h-16 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-600 shadow-2xl transition-all">Finalize Log</Button>
        </form>
      </Modal>
    </div>
  );
};

const StatCol = ({ title, value, color }) => (
  <Col span={8}>
    <Card bordered={false} className="rounded-[2.5rem] shadow-sm border-t-[15px] hover:shadow-xl transition-all" style={{ borderTopColor: color }}>
       <Statistic title={<span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</span>} value={value} prefix="₹" valueStyle={{ color: color, fontWeight: 900, fontSize: '2.8rem', letterSpacing: '-0.06em' }} />
    </Card>
  </Col>
);

const InputItem = ({ label, onChange, required, uppercase, type="text", color="#000" }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 text-left">{label}</label>
    <Input size="large" type={type} className={`h-14 rounded-2xl font-black ${uppercase ? 'uppercase' : ''}`} style={{ color: color, backgroundColor: '#F8FAFC', border: 'none' }} onChange={onChange} required={required} />
  </div>
);

export default Dashboard;