
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase Credentials
const SUPABASE_URL = 'https://qmauwmzkljbzphslopon.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VVjdK4Lxe8lh1ZiZCt20fg_iA9M39J_';

export const isSupabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('ps_supabase_url', url);
  localStorage.setItem('ps_supabase_key', key);
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('ps_supabase_url');
  localStorage.removeItem('ps_supabase_key');
  window.location.reload();
};

// SQL Schema with quoted identifiers and SAMPLE DATA
export const SCHEMA_SQL = `
-- 1. CLEANUP (Optional - Uncomment if you want to reset everything)
-- DROP TABLE IF EXISTS attendance;
-- DROP TABLE IF EXISTS bonuses;
-- DROP TABLE IF EXISTS advances;
-- DROP TABLE IF EXISTS payroll;
-- DROP TABLE IF EXISTS employees;
-- DROP TABLE IF EXISTS app_settings;

-- 2. CREATE TABLES
CREATE TABLE IF NOT EXISTS employees (
  "id" TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "department" TEXT,
  "position" TEXT,
  "baseSalary" NUMERIC DEFAULT 0,
  "allowances" NUMERIC DEFAULT 0,
  "gifts" NUMERIC DEFAULT 0,
  "deductions" NUMERIC DEFAULT 0,
  "salaryAdvance" NUMERIC DEFAULT 0,
  "status" TEXT DEFAULT 'Active',
  "joiningDate" DATE DEFAULT CURRENT_DATE,
  "bankAccount" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS payroll (
  "id" TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees("id") ON DELETE CASCADE,
  "month" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "grossPay" NUMERIC DEFAULT 0,
  "netPay" NUMERIC DEFAULT 0,
  "status" TEXT DEFAULT 'Paid',
  "processedDate" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS advances (
  "id" TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees("id") ON DELETE CASCADE,
  "employeeName" TEXT,
  "amount" NUMERIC NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "reason" TEXT
);

CREATE TABLE IF NOT EXISTS bonuses (
  "id" TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees("id") ON DELETE CASCADE,
  "employeeName" TEXT,
  "amount" NUMERIC NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "reason" TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  "id" TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees("id") ON DELETE CASCADE,
  "employeeName" TEXT,
  "date" DATE NOT NULL,
  "checkIn" TIME,
  "checkOut" TIME,
  "status" TEXT,
  "deviceSource" TEXT
);

CREATE TABLE IF NOT EXISTS app_settings (
  "key" TEXT PRIMARY KEY,
  "value" JSONB
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (Allow all for development)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All' AND tablename = 'employees') THEN
        CREATE POLICY "Allow All" ON employees FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All' AND tablename = 'payroll') THEN
        CREATE POLICY "Allow All" ON payroll FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All' AND tablename = 'advances') THEN
        CREATE POLICY "Allow All" ON advances FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All' AND tablename = 'bonuses') THEN
        CREATE POLICY "Allow All" ON bonuses FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All' AND tablename = 'attendance') THEN
        CREATE POLICY "Allow All" ON attendance FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All' AND tablename = 'app_settings') THEN
        CREATE POLICY "Allow All" ON app_settings FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 5. INSERT SAMPLE DATA
-- Insert Employees
INSERT INTO employees ("id", "firstName", "lastName", "email", "department", "position", "baseSalary", "bankAccount", "status")
VALUES 
('EMP001', 'John', 'Doe', 'john@example.com', 'Engineering', 'Senior Dev', 150000, 'BOC 123456', 'Active'),
('EMP002', 'Jane', 'Smith', 'jane@example.com', 'Marketing', 'Lead Designer', 120000, 'HNB 654321', 'Active'),
('EMP003', 'Mike', 'Ross', 'mike@example.com', 'Legal', 'Associate', 95000, 'SAMPATH 112233', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Insert NOVEMBER Payroll (To fix the visibility issue requested)
INSERT INTO payroll ("id", "employeeId", "month", "year", "grossPay", "netPay", "status", "processedDate")
VALUES 
('PAY_NOV_001', 'EMP001', 'November', 2024, 150000, 145000, 'Paid', '2024-11-30T09:00:00Z'),
('PAY_NOV_002', 'EMP002', 'November', 2024, 120000, 118000, 'Paid', '2024-11-30T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Advance
INSERT INTO advances ("id", "employeeId", "employeeName", "amount", "date", "reason")
VALUES ('ADV_001', 'EMP001', 'John Doe', 20000, '2024-12-05T10:00:00Z', 'Emergency medical bill')
ON CONFLICT (id) DO NOTHING;

-- Update employee with that advance so it shows up in "Run Payroll"
UPDATE employees SET "salaryAdvance" = 20000 WHERE id = 'EMP001';

-- Insert Sample Settings
INSERT INTO app_settings ("key", "value")
VALUES 
('departments', '["Engineering", "Sales", "Marketing", "HR", "Operations", "Finance", "Legal"]'),
('positions', '["Senior Dev", "Lead Designer", "Associate", "Manager", "Intern"]')
ON CONFLICT (key) DO NOTHING;
`;
