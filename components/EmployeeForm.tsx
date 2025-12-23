
import React, { useState, useEffect } from 'react';
import { Employee, EmploymentStatus } from '../types';

interface EmployeeFormProps {
  employee?: Employee | null;
  departments: string[];
  positions: string[];
  onSave: (employee: Partial<Employee>) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ 
  employee, 
  departments, 
  positions, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: '',
    lastName: '',
    email: '',
    department: departments[0] || '',
    position: positions[0] || '',
    baseSalary: 0,
    allowances: 0,
    gifts: 0,
    deductions: 0,
    salaryAdvance: 0,
    status: EmploymentStatus.Active,
    joiningDate: new Date().toISOString().split('T')[0],
    bankAccount: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">First Name</label>
              <input 
                required 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Last Name</label>
              <input 
                required 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <input 
              required 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <select 
                name="department" 
                value={formData.department} 
                onChange={handleChange} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Position</label>
              <select 
                name="position" 
                value={formData.position} 
                onChange={handleChange} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900"
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Monthly Compensation & Tax (Rs.)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Base Salary</label>
                <input required type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-900 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Allowances</label>
                <input type="number" name="allowances" value={formData.allowances} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tax / Fixed Deductions</label>
                <input type="number" name="deductions" value={formData.deductions} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-rose-600 font-medium" />
              </div>
              <div className="space-y-2 opacity-50">
                <label className="text-sm font-semibold text-slate-400">Gifts (Set via Bonuses tab)</label>
                <input disabled type="number" name="gifts" value={formData.gifts} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-400 bg-slate-100 cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Bank Account Number</label>
            <input 
              required 
              type="text" 
              name="bankAccount" 
              value={formData.bankAccount} 
              onChange={handleChange} 
              placeholder="e.g. 0123 4567 8901 (BOC/HNB)"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 font-mono" 
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onCancel} className="flex-1 py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 px-6 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              {employee ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
