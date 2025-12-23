
import React from 'react';
import { Employee } from '../types';
import { PayslipStaticContent } from '../App';

interface PayslipModalProps {
  employee: Employee;
  onClose: () => void;
}

const PayslipModal: React.FC<PayslipModalProps> = ({ employee, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[80] flex flex-col no-print">
      {/* Action Bar */}
      <div className="bg-white border-b border-slate-200 p-3 md:p-4 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">P</div>
          <div className="hidden sm:block">
             <h2 className="text-sm font-bold text-slate-800">Print Preview</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{employee.firstName} {employee.lastName}</p>
          </div>
          <div className="sm:hidden">
             <h2 className="text-xs font-bold text-slate-800">Preview</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            <span className="hidden xs:inline">Print</span>
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-12 bg-slate-800/30 custom-scrollbar">
        <div className="min-w-fit flex justify-center py-4">
           <div className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden w-full max-w-[800px] sm:min-w-[700px]">
              <PayslipStaticContent employee={employee} />
           </div>
        </div>
        <div className="sm:hidden text-center text-slate-400 text-[10px] font-bold pb-10 uppercase tracking-widest">
           Swipe horizontally to view full page
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
