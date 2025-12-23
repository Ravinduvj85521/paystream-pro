
import React from 'react';
import { Icons } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'employees', label: 'Employees', icon: Icons.Users },
    { id: 'attendance', label: 'Attendance', icon: Icons.Clock },
    { id: 'advances', label: 'Advances', icon: Icons.Wallet },
    { id: 'bonuses', label: 'Bonuses', icon: Icons.Gift },
    { id: 'payroll', label: 'Run Payroll', icon: Icons.Payroll },
    { id: 'settings', label: 'Settings', icon: Icons.Settings },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
    lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <div className={sidebarClasses}>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100">
              P
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">PayStream</span>
          </div>
          <button className="lg:hidden p-1 text-slate-400" onClick={() => setIsOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <nav className="px-3 mt-2 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
                }`}
              >
                <div className={isActive ? 'text-white' : 'text-slate-400'}>
                  <item.icon />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-5">
          <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Cloud Sync Active</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
