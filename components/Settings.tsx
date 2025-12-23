
import React, { useState, useEffect } from 'react';
import { supabase, SCHEMA_SQL } from '../db';

interface SettingsProps {
  departments: string[];
  positions: string[];
  onUpdateDepartments: (depts: string[]) => void;
  onUpdatePositions: (pos: string[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  departments, 
  positions, 
  onUpdateDepartments, 
  onUpdatePositions 
}) => {
  const [newDept, setNewDept] = useState('');
  const [newPos, setNewPos] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'org' | 'database'>('org');
  const [dbStats, setDbStats] = useState({ employees: 0, payroll: 0, advances: 0, bonuses: 0, attendance: 0 });
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emp, pay, adv, bon, att] = await Promise.all([
          supabase.from('employees').select('id', { count: 'exact', head: true }),
          supabase.from('payroll').select('id', { count: 'exact', head: true }),
          supabase.from('advances').select('id', { count: 'exact', head: true }),
          supabase.from('bonuses').select('id', { count: 'exact', head: true }),
          supabase.from('attendance').select('id', { count: 'exact', head: true }),
        ]);

        setDbStats({
          employees: emp.count || 0,
          payroll: pay.count || 0,
          advances: adv.count || 0,
          bonuses: bon.count || 0,
          attendance: att.count || 0,
        });
      } catch (e) { console.error("Stats fetch error:", e); }
    };
    if (activeSubTab === 'database') fetchStats();
  }, [activeSubTab]);

  const addDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDept && !departments.includes(newDept)) {
      onUpdateDepartments([...departments, newDept]);
      setNewDept('');
    }
  };

  const addPos = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPos && !positions.includes(newPos)) {
      onUpdatePositions([...positions, newPos]);
      setNewPos('');
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    alert("SQL copied to clipboard! Paste this into your Supabase SQL Editor.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your organization and manage cloud data.</p>
      </div>

      <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveSubTab('org')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'org' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          ORGANIZATION
        </button>
        <button 
          onClick={() => setActiveSubTab('database')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'database' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          SUPABASE CLOUD
        </button>
      </div>

      {activeSubTab === 'org' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Departments</h3>
              <p className="text-xs text-slate-500">Manage business units</p>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <form onSubmit={addDept} className="flex gap-2">
                <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="New department name" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20" />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors">Add</button>
              </form>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                    <span className="text-sm font-medium text-slate-700">{dept}</span>
                    <button onClick={() => onUpdateDepartments(departments.filter(d => d !== dept))} className="p-1 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Job Positions</h3>
              <p className="text-xs text-slate-500">Manage organizational roles</p>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <form onSubmit={addPos} className="flex gap-2">
                <input type="text" value={newPos} onChange={(e) => setNewPos(e.target.value)} placeholder="New position title" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20" />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors">Add</button>
              </form>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {positions.map((pos) => (
                  <div key={pos} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                    <span className="text-sm font-medium text-slate-700">{pos}</span>
                    <button onClick={() => onUpdatePositions(positions.filter(p => p !== pos))} className="p-1 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Supabase Cloud Sync</h3>
                <p className="text-sm text-slate-500">The application is pre-configured with your cloud database.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Pre-Configured</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
              <DbMetric label="Staff" count={dbStats.employees} />
              <DbMetric label="Payroll" count={dbStats.payroll} />
              <DbMetric label="Advances" count={dbStats.advances} />
              <DbMetric label="Bonuses" count={dbStats.bonuses} />
              <DbMetric label="Attendance" count={dbStats.attendance} />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button onClick={() => setShowSql(!showSql)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                {showSql ? 'Hide SQL Schema' : 'Setup SQL Script'}
              </button>
            </div>

            {showSql && (
              <div className="mt-8 bg-slate-900 rounded-2xl p-6 relative group">
                <button onClick={copySql} className="absolute top-4 right-4 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
                <div className="mb-4 text-indigo-400 text-xs font-mono font-bold tracking-widest uppercase">SQL INITIALIZATION SCRIPT</div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto custom-scrollbar font-mono leading-relaxed">
                  {SCHEMA_SQL}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DbMetric = ({ label, count }: { label: string, count: number }) => (
  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-black text-slate-800 mt-1">{count}</p>
  </div>
);

export default Settings;
