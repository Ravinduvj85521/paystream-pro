
import React, { useState } from 'react';
import { Employee, BonusTransaction } from '../types';
import { Icons } from '../constants';

interface BonusesProps {
  employees: Employee[];
  bonusHistory: BonusTransaction[];
  onIssueBonus: (employeeId: string, amount: number, reason: string) => void;
}

const Bonuses: React.FC<BonusesProps> = ({ employees, bonusHistory, onIssueBonus }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !amount) return;
    onIssueBonus(selectedEmployeeId, parseFloat(amount), reason);
    setSelectedEmployeeId('');
    setAmount('');
    setReason('');
  };

  const totalIssued = bonusHistory.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Employee Bonuses</h1>
          <p className="text-slate-500 text-sm">Reward excellence with one-off bonuses (Rs.).</p>
        </div>
        <div className="bg-indigo-500 px-6 py-4 rounded-3xl shadow-xl">
          <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Total Rewarded (YTD)</p>
          <p className="text-xl md:text-2xl font-black text-white">Rs. {totalIssued.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Issue New Bonus</h3>
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
                <label className="text-sm font-semibold text-slate-700">Reason / Achievement</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-20 resize-none text-slate-900" 
                  placeholder="Top performance, project completion, etc." 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                <Icons.Gift />
                <span>Issue Bonus</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Bonus Log</h3>
              <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">REWARDS HISTORY</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bonusHistory.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                        <p className="text-[10px] font-mono text-slate-400">#{t.id.toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{t.employeeName}</td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px] truncate">{t.reason || '-'}</td>
                      <td className="px-6 py-4 text-right font-black text-green-600">Rs. {t.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {bonusHistory.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">No recorded bonuses.</td></tr>
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

export default Bonuses;
