
import React, { useState, useMemo } from 'react';
import { Employee, PayrollRecord } from '../types';
import { MONTHS, Icons } from '../constants';

interface PayrollProcessorProps {
  employees: Employee[];
  payrollHistory: PayrollRecord[];
  onProcess: (records: PayrollRecord[]) => void;
  onPrintPayslip: (employee: Employee) => void;
}

/**
 * Universal helper to handle property access regardless of database casing.
 */
const getVal = (obj: any, key: string): any => {
  if (!obj) return undefined;
  if (obj[key] !== undefined) return obj[key];
  
  const lowerKey = key.toLowerCase();
  if (obj[lowerKey] !== undefined) return obj[lowerKey];
  
  const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  if (obj[snakeKey] !== undefined) return obj[snakeKey];

  const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
  return foundKey ? obj[foundKey] : undefined;
};

const getNum = (obj: any, key: string): number => {
  const val = getVal(obj, key);
  return Number(val) || 0;
};

const PayrollProcessor: React.FC<PayrollProcessorProps> = ({ 
  employees, 
  payrollHistory,
  onProcess, 
  onPrintPayslip
}) => {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'pending' | 'history'>('pending');

  const activeEmployees = useMemo(() => employees.filter(e => e.status !== 'Terminated'), [employees]);

  // 1. Identify who is NOT yet processed (Pending Run)
  const unprocessedEmployees = useMemo(() => {
    return activeEmployees.filter(emp => {
      const empId = getVal(emp, 'id');
      const alreadyProcessed = payrollHistory.some(history => {
        const hEmpId = getVal(history, 'employeeId');
        const hMonth = (getVal(history, 'month') || '').toString().toLowerCase();
        const hYear = Number(getVal(history, 'year'));
        
        // Use case-insensitive comparison for months
        return hEmpId === empId && 
               hMonth === selectedMonth.toLowerCase() && 
               hYear === Number(selectedYear);
      });
      return !alreadyProcessed;
    });
  }, [activeEmployees, payrollHistory, selectedMonth, selectedYear]);

  // 2. Identify who WAS processed for this period (History)
  const processedRecords = useMemo(() => {
    return payrollHistory.filter(history => {
      const hMonth = (getVal(history, 'month') || '').toString().toLowerCase();
      const hYear = Number(getVal(history, 'year'));
      return hMonth === selectedMonth.toLowerCase() && hYear === Number(selectedYear);
    });
  }, [payrollHistory, selectedMonth, selectedYear]);

  // 3. Search Filter Logic
  const filteredUnprocessed = useMemo(() => {
    if (!searchTerm.trim()) return unprocessedEmployees;
    const lowerSearch = searchTerm.toLowerCase();
    return unprocessedEmployees.filter(emp => {
      const fullName = `${getVal(emp, 'firstName') || ''} ${getVal(emp, 'lastName') || ''}`.toLowerCase();
      const empId = (getVal(emp, 'id') || '').toString().toLowerCase();
      return fullName.includes(lowerSearch) || empId.includes(lowerSearch);
    });
  }, [unprocessedEmployees, searchTerm]);

  // 4. Draft Records generation
  const previewRecords = useMemo(() => {
    return filteredUnprocessed.map(e => {
      const base = getNum(e, 'baseSalary');
      const allowances = getNum(e, 'allowances');
      const gifts = getNum(e, 'gifts');
      const taxDeductions = getNum(e, 'deductions');
      const advances = getNum(e, 'salaryAdvance');

      return {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: getVal(e, 'id'),
        month: selectedMonth,
        year: selectedYear,
        grossPay: base + allowances + gifts,
        netPay: (base + allowances + gifts) - (taxDeductions + advances),
        status: 'Draft' as const,
        processedDate: new Date().toISOString(),
      };
    });
  }, [filteredUnprocessed, selectedMonth, selectedYear]);

  const totalNetPayout = previewRecords.reduce((sum, r) => sum + r.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Payroll Center</h1>
          <p className="text-slate-500 text-sm">Managing disbursements for {selectedMonth} {selectedYear}.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
          >
            {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
          <button 
            onClick={() => setViewMode('pending')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'pending' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            PENDING RUN ({unprocessedEmployees.length})
          </button>
          <button 
            onClick={() => setViewMode('history')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            COMPLETED RUNS ({processedRecords.length})
          </button>
        </div>

        {viewMode === 'pending' ? (
          <>
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Calculated Net Payout</span>
                <div className="flex items-baseline gap-2 mt-1 justify-center md:justify-start">
                  <h2 className="text-3xl md:text-4xl font-black text-indigo-600">Rs. {totalNetPayout.toLocaleString()}</h2>
                </div>
                <p className="text-slate-400 text-xs mt-1">Ready for {unprocessedEmployees.length} staff members</p>
              </div>
              <button 
                onClick={() => {
                  if (previewRecords.length === 0) return;
                  if (confirm(`Process payroll for ${previewRecords.length} employees?`)) {
                    onProcess(previewRecords);
                  }
                }}
                disabled={previewRecords.length === 0}
                className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black transition-all shadow-xl uppercase tracking-wider text-sm ${
                  previewRecords.length === 0 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                {previewRecords.length === 0 ? 'Period Fully Processed' : 'Process Batch Records'}
              </button>
            </div>

            <div className="p-4 bg-white border-b border-slate-100">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search pending employees..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Base</th>
                    <th className="px-6 py-4 text-right">Additions</th>
                    <th className="px-6 py-4 text-right">Deductions</th>
                    <th className="px-6 py-4 text-right text-indigo-600">Net Final</th>
                    <th className="px-6 py-4 text-center">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRecords.map((record) => {
                    const emp = activeEmployees.find(e => getVal(e, 'id') === record.employeeId);
                    if (!emp) return null;
                    const additions = getNum(emp, 'allowances') + getNum(emp, 'gifts');
                    const deductions = getNum(emp, 'deductions') + getNum(emp, 'salaryAdvance');

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">{getVal(emp, 'firstName')} {getVal(emp, 'lastName')}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">ID: {record.employeeId}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-600">Rs. {getNum(emp, 'baseSalary').toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-green-600 font-black">+Rs. {additions.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-rose-500 font-black">-Rs. {deductions.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 text-sm bg-indigo-50/20">
                          Rs. {record.netPay.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => onPrintPayslip(emp)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View Payslip">
                               <Icons.Dashboard />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {previewRecords.length === 0 && (
                <div className="py-24 text-center">
                  <div className="flex justify-center mb-4 text-slate-200">
                     <Icons.Payroll />
                  </div>
                  <p className="text-sm font-medium text-slate-400 italic">
                    {processedRecords.length > 0 
                      ? `Payroll for ${selectedMonth} ${selectedYear} is already completed.` 
                      : `No employees found to process for ${selectedMonth} ${selectedYear}.`}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Processed Date</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4 text-right">Gross Pay</th>
                  <th className="px-6 py-4 text-right">Net Pay</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 font-medium">
                        {new Date(getVal(record, 'processedDate')).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900">{getVal(record, 'employeeId')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs text-slate-600">Rs. {getNum(record, 'grossPay').toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-black text-indigo-600">Rs. {getNum(record, 'netPay').toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase">
                        {getVal(record, 'status') || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))}
                {processedRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-slate-400 italic text-sm">
                      No payroll records found for {selectedMonth} {selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollProcessor;
