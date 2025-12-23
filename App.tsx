
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import PayrollProcessor from './components/PayrollProcessor';
import Advances from './components/Advances';
import Bonuses from './components/Bonuses';
import Settings from './components/Settings';
import Attendance from './components/Attendance';
import PayslipModal from './components/PayslipModal';
import { supabase } from './db';
import { Employee, EmploymentStatus, PayrollRecord, AdvanceTransaction, BonusTransaction, AttendanceEntry } from './types';

const INITIAL_DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
const INITIAL_POSITIONS = ['Manager', 'Developer', 'Designer', 'Executive', 'Intern', 'Lead'];

// Universal robust property reading helper
const getVal = (obj: any, key: string): any => {
  if (!obj) return undefined;
  if (obj[key] !== undefined) return obj[key];
  const lowerKey = key.toLowerCase();
  if (obj[lowerKey] !== undefined) return obj[lowerKey];
  const found = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
  return found ? obj[found] : undefined;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const [advanceHistory, setAdvanceHistory] = useState<AdvanceTransaction[]>([]);
  const [bonusHistory, setBonusHistory] = useState<BonusTransaction[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceEntry[]>([]);
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [positions, setPositions] = useState<string[]>(INITIAL_POSITIONS);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [printingEmployee, setPrintingEmployee] = useState<Employee | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [empRes, payRes, advRes, bonRes, attRes, setRes] = await Promise.all([
          supabase.from('employees').select('*'),
          supabase.from('payroll').select('*').order('processedDate', { ascending: false }),
          supabase.from('advances').select('*').order('date', { ascending: false }),
          supabase.from('bonuses').select('*').order('date', { ascending: false }),
          supabase.from('attendance').select('*').order('date', { ascending: false }),
          supabase.from('app_settings').select('*')
        ]);

        if (empRes.error) throw empRes.error;
        setEmployees(empRes.data || []);
        setPayrollHistory(payRes.data || []);
        setAdvanceHistory(advRes.data || []);
        setBonusHistory(bonRes.data || []);
        setAttendanceHistory(attRes.data || []);

        const depts = setRes.data?.find(s => s.key === 'departments')?.value;
        const pos = setRes.data?.find(s => s.key === 'positions')?.value;
        if (depts) setDepartments(depts);
        if (pos) setPositions(pos);
        
      } catch (err: any) {
        console.error("Supabase load error:", err);
        setError(err.message || "Failed to connect to Supabase. Ensure your table schema is created.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    try {
      const empId = getVal(editingEmployee, 'id');
      if (editingEmployee && empId) {
        const { id, created_at, ...updatePayload } = employeeData as any;
        const { error } = await supabase.from('employees').update(updatePayload).eq('id', empId);
        if (error) throw error;
        setEmployees(prev => prev.map(e => getVal(e, 'id') === empId ? { ...e, ...updatePayload } as Employee : e));
      } else {
        const newEmployee = {
          salaryAdvance: 0,
          gifts: 0,
          deductions: 0,
          allowances: 0,
          ...employeeData,
          id: Math.random().toString(36).substr(2, 9),
          status: EmploymentStatus.Active
        } as Employee;
        const { error } = await supabase.from('employees').insert(newEmployee);
        if (error) throw error;
        setEmployees(prev => [...prev, newEmployee]);
      }
      closeForm();
    } catch (err: any) { 
      console.error("Save error:", err);
      alert(err.message); 
    }
  };

  const handleIssueAdvance = async (id: string, amt: number, res: string) => {
    const emp = employees.find(e => getVal(e, 'id') === id);
    if (!emp) return;
    
    const currentAdv = Number(getVal(emp, 'salaryAdvance') || 0);
    const newTotal = currentAdv + Number(amt);

    const trans = { 
      id: Math.random().toString(36).substr(2, 9), 
      employeeId: id, 
      employeeName: `${getVal(emp, 'firstName')} ${getVal(emp, 'lastName')}`, 
      amount: amt, 
      date: new Date().toISOString(), 
      reason: res 
    };

    try {
      const { error: advErr } = await supabase.from('advances').insert(trans);
      if (advErr) throw advErr;
      
      const { error: empErr } = await supabase.from('employees').update({ salaryAdvance: newTotal }).eq('id', id);
      if (empErr) throw empErr;
      
      setAdvanceHistory(prev => [trans, ...prev]);
      setEmployees(prev => prev.map(e => getVal(e, 'id') === id ? { ...e, salaryAdvance: newTotal } : e));
    } catch (err: any) { 
      console.error("Advance error:", err);
      alert(err.message); 
    }
  };

  const handleIssueBonus = async (id: string, amt: number, res: string) => {
    const emp = employees.find(e => getVal(e, 'id') === id);
    if (!emp) return;

    const currentGifts = Number(getVal(emp, 'gifts') || 0);
    const newTotal = currentGifts + Number(amt);

    const trans = { 
      id: Math.random().toString(36).substr(2, 9), 
      employeeId: id, 
      employeeName: `${getVal(emp, 'firstName')} ${getVal(emp, 'lastName')}`, 
      amount: amt, 
      date: new Date().toISOString(), 
      reason: res 
    };

    try {
      const { error: bonErr } = await supabase.from('bonuses').insert(trans);
      if (bonErr) throw bonErr;
      
      const { error: empErr } = await supabase.from('employees').update({ gifts: newTotal }).eq('id', id);
      if (empErr) throw empErr;
      
      setBonusHistory(prev => [trans, ...prev]);
      setEmployees(prev => prev.map(e => getVal(e, 'id') === id ? { ...e, gifts: newTotal } : e));
    } catch (err: any) { 
      console.error("Bonus error:", err);
      alert(err.message); 
    }
  };

  const handleProcessPayroll = async (recs: PayrollRecord[]) => {
    try {
      const { error: payErr } = await supabase.from('payroll').insert(recs);
      if (payErr) throw payErr;
      
      const ids = recs.map(r => r.employeeId);
      const { error: empErr } = await supabase.from('employees').update({ salaryAdvance: 0, gifts: 0 }).in('id', ids);
      if (empErr) throw empErr;
      
      setPayrollHistory(prev => [...recs, ...prev]);
      setEmployees(prev => prev.map(e => ids.includes(getVal(e, 'id')) ? { ...e, salaryAdvance: 0, gifts: 0 } : e));
      setActiveTab('dashboard');
    } catch (err: any) { 
      console.error("Payroll process error:", err);
      alert(err.message); 
    }
  };

  const updateDepartments = async (depts: string[]) => {
    await supabase.from('app_settings').upsert({ key: 'departments', value: depts });
    setDepartments(depts);
  };

  const updatePositions = async (pos: string[]) => {
    await supabase.from('app_settings').upsert({ key: 'positions', value: pos });
    setPositions(pos);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold text-sm uppercase tracking-widest">Connecting to Cloud Database...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard employees={employees} payrollHistory={payrollHistory} />;
      case 'employees': return <EmployeeList employees={employees} onAddEmployee={() => setIsFormOpen(true)} onEditEmployee={handleEditClick} onDeleteEmployee={async (id) => { await supabase.from('employees').delete().eq('id', id); setEmployees(prev => prev.filter(e => getVal(e, 'id') !== id)); }} onPrintPayslip={setPrintingEmployee} />;
      case 'attendance': return <Attendance employees={employees} attendanceEntries={attendanceHistory} onAddEntries={async (entries) => { await supabase.from('attendance').insert(entries); setAttendanceHistory(prev => [...entries, ...prev]); }} />;
      case 'advances': return <Advances employees={employees} advanceHistory={advanceHistory} onIssueAdvance={handleIssueAdvance} />;
      case 'bonuses': return <Bonuses employees={employees} bonusHistory={bonusHistory} onIssueBonus={handleIssueBonus} />;
      case 'payroll': return <PayrollProcessor employees={employees} payrollHistory={payrollHistory} onProcess={handleProcessPayroll} onPrintPayslip={setPrintingEmployee} />;
      case 'settings': return <Settings departments={departments} positions={positions} onUpdateDepartments={updateDepartments} onUpdatePositions={updatePositions} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-inter text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="lg:hidden bg-indigo-600 text-white p-3 flex items-center justify-between z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>
          <span className="font-bold">PayStream</span>
          <div className="w-6"></div>
        </header>
        {error && (
          <div className="bg-rose-600 text-white p-2 text-center text-xs font-bold animate-pulse">
            {error} - <button onClick={() => window.location.reload()} className="underline">Retry</button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">{renderContent()}</div>
        </main>
      </div>
      {isFormOpen && <EmployeeForm employee={editingEmployee} departments={departments} positions={positions} onSave={handleSaveEmployee} onCancel={closeForm} />}
      {printingEmployee && <PayslipModal employee={printingEmployee} onClose={() => setPrintingEmployee(null)} />}
    </div>
  );
};

export const PayslipStaticContent: React.FC<{ employee: Employee }> = ({ employee }) => {
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const base = Number(getVal(employee, 'baseSalary') || 0);
  const allowances = Number(getVal(employee, 'allowances') || 0);
  const gifts = Number(getVal(employee, 'gifts') || 0);
  const deductions = Number(getVal(employee, 'deductions') || 0);
  const advance = Number(getVal(employee, 'salaryAdvance') || 0);

  const totalEarnings = base + allowances + gifts;
  const totalDeductions = deductions + advance;
  const netPay = totalEarnings - totalDeductions;

  return (
    <div className="w-full max-w-[800px] mx-auto p-6 md:p-14 bg-white box-border print:p-0" style={{ minHeight: '1130px', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <style>{`
        .pdf-table { width: 100%; border-collapse: collapse; }
        .pdf-table td { vertical-align: top; }
        .text-right { text-align: right; }
        .bold { font-weight: 800; }
        .black { font-weight: 900; }
        @media screen and (max-width: 640px) {
          .payslip-header { flex-direction: column; text-align: center; }
          .payslip-header td { display: block; width: 100% !important; text-align: center !important; margin-bottom: 20px; }
          .payslip-info td { display: block; width: 100% !important; text-align: center !important; margin-bottom: 20px; }
          .earnings-deductions th, .earnings-deductions td { display: block; width: 100% !important; border-right: none !important; }
          .earnings-deductions td { height: auto !important; }
          .net-payable td { display: block; width: 100% !important; text-align: center !important; padding: 20px !important; }
        }
      `}</style>
      <table className="pdf-table payslip-header" style={{ marginBottom: '40px' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%' }}>
              <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px' }}>PAYSTREAM PRO</h1>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>Monthly Salary Statement</p>
            </td>
            <td style={{ width: '40%' }} className="text-right">
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', margin: 0 }}>PERIOD</p>
              <p style={{ fontSize: '26px', fontWeight: 900, color: '#4f46e5', margin: '2px 0 0 0' }}>{monthName} {year}</p>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ height: '2px', backgroundColor: '#f1f5f9', marginBottom: '40px' }}></div>
      <table className="pdf-table payslip-info" style={{ marginBottom: '50px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%' }}>
              <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>EMPLOYEE</p>
              <p style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: '#0f172a' }}>{getVal(employee, 'firstName')} {getVal(employee, 'lastName')}</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginTop: '4px' }}>{getVal(employee, 'position')}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{getVal(employee, 'department')} Division</p>
            </td>
            <td style={{ width: '50%' }} className="text-right">
              <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>DISBURSEMENT</p>
              <p style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Bank Account Transfer</p>
              <p style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '5px' }}>{getVal(employee, 'bankAccount')}</p>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ border: '2px solid #0f172a', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px' }}>
        <table className="pdf-table earnings-deductions">
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              <th style={{ width: '50%', padding: '18px 30px', textAlign: 'left', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', borderRight: '1px solid #334155' }}>Earnings</th>
              <th style={{ width: '50%', padding: '18px 30px', textAlign: 'left', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>Deductions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '30px', borderRight: '2px solid #0f172a', height: '260px' }}>
                <table style={{ width: '100%', fontSize: '14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: '15px', color: '#475569', fontWeight: 600 }}>Basic Salary</td>
                      <td style={{ paddingBottom: '15px', textAlign: 'right', fontWeight: 800 }}>Rs. {base.toLocaleString()}</td>
                    </tr>
                    {allowances > 0 && (
                      <tr>
                        <td style={{ paddingBottom: '15px', color: '#475569', fontWeight: 600 }}>Allowances</td>
                        <td style={{ paddingBottom: '15px', textAlign: 'right', fontWeight: 800 }}>Rs. {allowances.toLocaleString()}</td>
                      </tr>
                    )}
                    {gifts > 0 && (
                      <tr>
                        <td style={{ paddingBottom: '15px', color: '#2563eb', fontWeight: 800 }}>Bonuses</td>
                        <td style={{ paddingBottom: '15px', textAlign: 'right', fontWeight: 800, color: '#2563eb' }}>Rs. {gifts.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
              <td style={{ padding: '30px' }}>
                <table style={{ width: '100%', fontSize: '14px' }}>
                  <tbody>
                    {advance > 0 && (
                      <tr>
                        <td style={{ paddingBottom: '15px', color: '#e11d48', fontWeight: 600 }}>Advance recovery</td>
                        <td style={{ paddingBottom: '15px', textAlign: 'right', fontWeight: 800, color: '#e11d48' }}>-Rs. {advance.toLocaleString()}</td>
                      </tr>
                    )}
                    {deductions > 0 && (
                      <tr>
                        <td style={{ paddingBottom: '15px', color: '#e11d48', fontWeight: 600 }}>Tax / Other</td>
                        <td style={{ paddingBottom: '15px', textAlign: 'right', fontWeight: 800, color: '#e11d48' }}>-Rs. {deductions.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid #0f172a', backgroundColor: '#f8fafc' }}>
              <td style={{ padding: '22px 30px', borderRight: '2px solid #0f172a' }}>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ float: 'left', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Gross Total</span>
                  <span style={{ float: 'right', fontSize: '18px', fontWeight: 900 }}>Rs. {totalEarnings.toLocaleString()}</span>
                </div>
              </td>
              <td style={{ padding: '22px 30px' }}>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ float: 'left', fontSize: '11px', fontWeight: 900, color: '#f43f5e', textTransform: 'uppercase' }}>Total Deductions</span>
                  <span style={{ float: 'right', fontSize: '18px', fontWeight: 900, color: '#be123c' }}>Rs. {totalDeductions.toLocaleString()}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <table className="pdf-table net-payable" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '24px', marginBottom: '60px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '45px' }}>
              <p style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: '#818cf8', margin: 0 }}>NET SALARY PAYABLE</p>
              <h3 style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px', margin: '8px 0 0 0' }}>LKR (Sri Lankan Rupees)</h3>
            </td>
            <td style={{ padding: '45px' }} className="text-right">
              <p style={{ fontSize: '48px', fontWeight: 900, margin: 0, letterSpacing: '-2px' }}>Rs. {netPay.toLocaleString()}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default App;
