
import React, { useState, useRef } from 'react';
import { Employee, AttendanceEntry, AttendanceStatus } from '../types';
import { Icons } from '../constants';

interface AttendanceProps {
  employees: Employee[];
  attendanceEntries: AttendanceEntry[];
  onAddEntries: (entries: AttendanceEntry[]) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ employees, attendanceEntries, onAddEntries }) => {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseHikvisionLogs(text);
    };
    reader.readAsText(file);
  };

  // Specialized parser for Hikvision DS-K1T series export format
  const parseHikvisionLogs = (csvContent: string) => {
    const lines = csvContent.split('\n');
    const newEntries: AttendanceEntry[] = [];
    
    // Attempting to match Hikvision's typical "Log Export" structure
    // Format: Event ID, Time, Employee ID, Event Type, etc.
    lines.forEach((line, index) => {
      if (index === 0 || !line.trim()) return;
      const parts = line.split(',');
      if (parts.length < 3) return;

      const timestamp = parts[1]?.trim(); // e.g. "2024-07-01 08:30:15"
      const deviceEmpId = parts[2]?.trim(); // Machine ID

      const employee = employees.find(e => e.id === deviceEmpId || e.email.includes(deviceEmpId));
      if (employee && timestamp) {
        const datePart = timestamp.split(' ')[0];
        const timePart = timestamp.split(' ')[1];
        
        newEntries.push({
          id: Math.random().toString(36).substr(2, 9),
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          date: datePart,
          checkIn: timePart,
          checkOut: null,
          status: timePart > '09:00:00' ? 'Late' : 'Present',
          deviceSource: 'DS-K1T320MFWX'
        });
      }
    });

    if (newEntries.length > 0) {
      onAddEntries(newEntries);
      alert(`Successfully synced ${newEntries.length} entries from Hikvision logs.`);
      setShowSyncModal(false);
    } else {
      alert("No matching employees found in the log file. Please check if Employee IDs in the machine match those in PayStream.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500 mt-1">Live check-in data from Hikvision Fingerprint Terminal.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Icons.Clock />
            <span>Sync with Machine</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time In</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceEntries.length > 0 ? (
                attendanceEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{entry.employeeName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.date}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-800">{entry.checkIn}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'Present' ? 'bg-green-100 text-green-700' :
                        entry.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {entry.deviceSource}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No attendance data found. Sync your Hikvision machine to see logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hikvision Integration Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Hikvision Integration</h2>
                  <p className="text-slate-500 text-sm mt-1">Model: DS-K1T320MFWX</p>
                </div>
                <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <p className="text-sm text-slate-700">Open your machine's Web UI or IVMS-4200 software.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <p className="text-sm text-slate-700">Go to <b>Status Monitoring</b> or <b>Data Management</b> and export <b>AcsEvent</b> logs as CSV.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <p className="text-sm text-slate-700">Upload the file below to sync with PayStream.</p>
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv,.txt"
                className="hidden" 
              />

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest text-xs"
              >
                Upload Machine Log File
              </button>

              <div className="pt-2 text-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Advanced: ISAPI Connection</p>
                 <code className="text-[9px] block mt-1 bg-slate-50 p-2 rounded text-slate-500 break-all">
                   /ISAPI/AccessControl/AcsEvent?format=json
                 </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
