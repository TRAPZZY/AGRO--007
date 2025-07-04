-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with enhanced security
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('farmer', 'investor', 'admin')) NOT NULL,
  phone VARCHAR,
  location VARCHAR,
  avatar_url VARCHAR,
  kyc_status VARCHAR DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Security fields
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  password_changed_at TIMESTAMP DEFAULT NOW()
);

-- Projects table with enhanced fields
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR CHECK (category IN ('crops', 'poultry', 'livestock', 'processing', 'equipment')) NOT NULL,
  location VARCHAR NOT NULL,
  funding_goal DECIMAL NOT NULL CHECK (funding_goal > 0),
  amount_raised DECIMAL DEFAULT 0 CHECK (amount_raised >= 0),
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded', 'completed', 'cancelled')),
  image_url VARCHAR,
  start_date DATE,
  end_date DATE,
  expected_return DECIMAL NOT NULL CHECK (expected_return > 0),
  risk_level VARCHAR CHECK (risk_level IN ('low', 'medium', 'high')) NOT NULL,
  min_investment DECIMAL DEFAULT 1000 CHECK (min_investment > 0),
  max_investment DECIMAL,
  
  -- Additional fields for production
  project_duration_months INTEGER,
  harvest_season VARCHAR,
  farming_method VARCHAR,
  certifications TEXT[],
  insurance_coverage BOOLEAN DEFAULT FALSE,
  weather_protection BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  funded_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Investments table with enhanced tracking
CREATE TABLE investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'refunded')),
  expected_return DECIMAL NOT NULL,
  actual_return DECIMAL DEFAULT 0,
  
  -- Payment tracking
  payment_method VARCHAR,
  payment_reference VARCHAR,
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Return tracking
  return_percentage DECIMAL,
  return_date DATE,
  return_status VARCHAR DEFAULT 'pending' CHECK (return_status IN ('pending', 'partial', 'completed')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  maturity_date DATE,
  
  -- Constraints
  UNIQUE(investor_id, project_id, created_at)
);

-- Investment returns tracking
CREATE TABLE investment_returns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  return_type VARCHAR CHECK (return_type IN ('interest', 'principal', 'bonus')) NOT NULL,
  payment_date DATE NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- KYC Documents table with enhanced security
CREATE TABLE kyc_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR CHECK (document_type IN ('id_card', 'passport', 'utility_bill', 'bank_statement', 'farm_document', 'business_registration')) NOT NULL,
  document_url VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  expires_at DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Security
  file_hash VARCHAR,
  file_size INTEGER,
  mime_type VARCHAR
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  category VARCHAR CHECK (category IN ('investment', 'project', 'kyc', 'payment', 'system')) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log table for security
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  table_name VARCHAR,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project updates table
CREATE TABLE project_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR,
  update_type VARCHAR CHECK (update_type IN ('progress', 'milestone', 'harvest', 'completion')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Enhanced RLS Policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can read active projects" ON projects FOR SELECT USING (status IN ('active', 'funded'));
CREATE POLICY "Farmers can manage own projects" ON projects FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Admins can manage all projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Investors can read own investments" ON investments FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors can create investments" ON investments FOR INSERT WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "Farmers can read investments in their projects" ON investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND farmer_id = auth.uid())
);

CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_projects_farmer_id ON projects(farmer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_project_id ON investments(project_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_investments AFTER INSERT OR UPDATE OR DELETE ON investments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Storage buckets with proper policies
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('project-images', 'project-images', true),
  ('kyc-documents', 'kyc-documents', false),
  ('avatars', 'avatars', true),
  ('project-updates', 'project-updates', true)
ON CONFLICT (id) DO NOTHING;

-- Enhanced storage policies
CREATE POLICY "Public can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Authenticated users can upload project images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'project-images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view own KYC documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can upload own KYC documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
