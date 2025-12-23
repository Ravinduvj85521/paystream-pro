
import React, { useState } from 'react';
import { Employee, AdvanceTransaction } from '../types';
import { Icons } from '../constants';

interface AdvancesProps {
  employees: Employee[];
  advanceHistory: AdvanceTransaction[];
  onIssueAdvance: (employeeId: string, amount: number, reason: string) => void;
}

const Advances: React.FC<AdvancesProps> = ({ employees, advanceHistory, onIssueAdvance }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !amount) return;
    onIssueAdvance(selectedEmployeeId, parseFloat(amount), reason);
    setSelectedEmployeeId('');
    setAmount('');
    setReason('');
  };

  const totalIssued = advanceHistory.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Salary Advances</h1>
          <p className="text-slate-500 text-sm">Track and manage employee short-term loans (Rs.).</p>
        </div>
        <div className="bg-indigo-600 px-6 py-4 rounded-3xl shadow-xl">
          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Total Issued (YTD)</p>
          <p className="text-xl md:text-2xl font-black text-white">Rs. {totalIssued.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 order-1 lg:order-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Issue New Advance</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Select Staff Member</label>
                <select 
                  required 
                  value={selectedEmployeeId} 
                  onChange={(e) => setSelectedEmployeeId(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium"
                >
                  <option value="" className="text-slate-500">Choose employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="text-slate-900">
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Amount (Rs.)</label>
                <input 
                  required 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" 
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Reason / Note</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-20 resize-none text-slate-900" 
                  placeholder="Emergency, education, etc." 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                <Icons.Plus />
                <span>Issue Advance</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 order-2 lg:order-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Advance Log</h3>
              <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">LIVE UPDATES</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advanceHistory.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                        <p className="text-[10px] font-mono text-slate-400">#{t.id.toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{t.employeeName}</td>
                      <td className="px-6 py-4 text-right font-black text-rose-600">Rs. {t.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {advanceHistory.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic text-sm">No recorded advances.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advances;
