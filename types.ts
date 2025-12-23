
export enum EmploymentStatus {
  Active = 'Active',
  OnLeave = 'On Leave',
  Terminated = 'Terminated'
}

export type PayrollStatus = 'Draft' | 'Processed' | 'Paid';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Off-Day';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: number;
  gifts: number;
  deductions: number;
  salaryAdvance: number;
  status: EmploymentStatus;
  joiningDate: string;
  bankAccount: string;
}

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: AttendanceStatus;
  deviceSource: string; // To track logs from the Hikvision machine
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  grossPay: number;
  netPay: number;
  status: PayrollStatus;
  processedDate: string;
}

export interface AdvanceTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
}

export interface BonusTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
}
