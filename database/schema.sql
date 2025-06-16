-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('farmer', 'investor', 'admin')) NOT NULL,
  phone VARCHAR,
  location VARCHAR,
  avatar_url VARCHAR,
  kyc_status VARCHAR DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR CHECK (category IN ('crops', 'poultry', 'livestock', 'processing', 'equipment')) NOT NULL,
  location VARCHAR NOT NULL,
  funding_goal DECIMAL NOT NULL,
  amount_raised DECIMAL DEFAULT 0,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded', 'completed', 'cancelled')),
  image_url VARCHAR,
  start_date DATE,
  end_date DATE,
  expected_return DECIMAL NOT NULL,
  risk_level VARCHAR CHECK (risk_level IN ('low', 'medium', 'high')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Investments table
CREATE TABLE investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  expected_return DECIMAL NOT NULL,
  actual_return DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- KYC Documents table
CREATE TABLE kyc_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR CHECK (document_type IN ('id_card', 'passport', 'utility_bill', 'bank_statement', 'farm_document')) NOT NULL,
  document_url VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Anyone can read active projects" ON projects FOR SELECT USING (status IN ('active', 'funded'));
CREATE POLICY "Farmers can manage own projects" ON projects FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Admins can manage all projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for investments
CREATE POLICY "Investors can read own investments" ON investments FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors can create investments" ON investments FOR INSERT WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "Farmers can read investments in their projects" ON investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND farmer_id = auth.uid())
);
CREATE POLICY "Admins can read all investments" ON investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for KYC documents
CREATE POLICY "Users can manage own KYC documents" ON kyc_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all KYC documents" ON kyc_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('project-images', 'project-images', true),
  ('kyc-documents', 'kyc-documents', false),
  ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Anyone can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Farmers can upload project images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'project-images' AND 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'farmer')
);

CREATE POLICY "Users can view own KYC documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can upload own KYC documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
