
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Employee, PayrollRecord } from '../types';
import { Icons } from '../constants';

interface DashboardProps {
  employees: Employee[];
  payrollHistory: PayrollRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees, payrollHistory }) => {
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const totalPayroll = payrollHistory.reduce((sum, rec) => sum + rec.netPay, 0);
    const avgSalary = employees.length ? employees.reduce((sum, e) => sum + e.baseSalary, 0) / employees.length : 0;
    const totalGifts = employees.reduce((sum, e) => sum + (e.gifts || 0), 0);
    const totalAdvances = employees.reduce((sum, e) => sum + (e.salaryAdvance || 0), 0);
    return { totalEmployees, activeEmployees, totalPayroll, avgSalary, totalGifts, totalAdvances };
  }, [employees, payrollHistory]);

  const costByDept = useMemo(() => {
    const depts: Record<string, number> = {};
    employees.forEach(e => {
      depts[e.department] = (depts[e.department] || 0) + e.baseSalary;
    });
    return Object.entries(depts).map(([name, cost]) => ({ name, cost }));
  }, [employees]);

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-xs">Real-time overview of payroll and staff metrics.</p>
      </div>

      {/* KPI Cards - Compact version */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          label="Total Payout" 
          value={`Rs. ${stats.totalPayroll.toLocaleString()}`} 
          color="bg-indigo-600"
          icon={<Icons.Dollar />} 
        />
        <StatCard 
          label="Active Staff" 
          value={stats.activeEmployees.toString()} 
          color="bg-slate-800"
          icon={<Icons.Users />} 
        />
        <StatCard 
          label="Pending Gifts" 
          value={`Rs. ${stats.totalGifts.toLocaleString()}`} 
          color="bg-indigo-500"
          icon={<Icons.Gift />} 
        />
        <StatCard 
          label="Outstanding Adv." 
          value={`Rs. ${stats.totalAdvances.toLocaleString()}`} 
          color="bg-rose-600"
          icon={<Icons.Wallet />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Department Cost Distribution</h3>
          <div className="h-[200px] md:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByDept}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <Icons.Payroll />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Avg. Monthly Salary</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">
              Rs. {Math.round(stats.avgSalary).toLocaleString()}
            </h4>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold">
            HEALTHY BUDGET
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: any) => (
  <div className={`${color} p-4 md:p-5 rounded-2xl shadow-sm transition-transform hover:scale-[1.02]`}>
    <div className="flex justify-between items-start">
      <div className="p-1.5 bg-white/10 text-white rounded-lg">
        {icon}
      </div>
    </div>
    <div className="mt-3">
      <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <h4 className="text-lg md:text-xl font-bold text-white mt-0.5 truncate">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
