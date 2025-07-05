-- Enable Row Level Security on all tables
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_role AS ENUM ('farmer', 'investor', 'admin');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'funded', 'completed', 'cancelled');
CREATE TYPE investment_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  phone TEXT,
  address TEXT,
  bio TEXT,
  profile_image_url TEXT,
  kyc_status kyc_status DEFAULT 'pending',
  kyc_document_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  total_invested DECIMAL(12,2) DEFAULT 0,
  total_earned DECIMAL(12,2) DEFAULT 0,
  login_count INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  project_type TEXT NOT NULL,
  funding_goal DECIMAL(12,2) NOT NULL,
  current_funding DECIMAL(12,2) DEFAULT 0,
  min_investment DECIMAL(12,2) DEFAULT 100,
  expected_duration INTEGER NOT NULL, -- in days
  expected_roi DECIMAL(5,2) NOT NULL, -- percentage
  status project_status DEFAULT 'draft',
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  progress_percentage INTEGER DEFAULT 0,
  risk_level INTEGER DEFAULT 1 CHECK (risk_level >= 1 AND risk_level <= 5),
  investor_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table
CREATE TABLE public.investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status investment_status DEFAULT 'pending',
  expected_return DECIMAL(12,2),
  actual_return DECIMAL(12,2),
  investment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  return_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, investor_id)
);

-- Project updates table
CREATE TABLE public.project_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  progress_percentage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_projects_farmer_id ON public.projects(farmer_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_investments_project_id ON public.investments(project_id);
CREATE INDEX idx_investments_investor_id ON public.investments(investor_id);
CREATE INDEX idx_investments_status ON public.investments(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Users policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

-- Projects policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone" ON public.projects
  FOR SELECT USING (status = 'active' OR auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = farmer_id);

-- Investments policies
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors can view their own investments" ON public.investments
  FOR SELECT USING (auth.uid() = investor_id);

CREATE POLICY "Farmers can view investments in their projects" ON public.investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = investments.project_id 
      AND projects.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Investors can insert their own investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Investors can update their own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = investor_id);

-- Project updates policies
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project updates are viewable by everyone" ON public.project_updates
  FOR SELECT USING (true);

CREATE POLICY "Farmers can insert updates for their projects" ON public.project_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_updates.project_id 
      AND projects.farmer_id = auth.uid()
    )
  );

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for user management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'investor')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update project funding
CREATE OR REPLACE FUNCTION update_project_funding()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET 
    current_funding = COALESCE((
      SELECT SUM(amount) 
      FROM public.investments 
      WHERE project_id = NEW.project_id 
      AND status = 'confirmed'
    ), 0),
    investor_count = COALESCE((
      SELECT COUNT(DISTINCT investor_id) 
      FROM public.investments 
      WHERE project_id = NEW.project_id 
      AND status = 'confirmed'
    ), 0)
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for investment updates
CREATE TRIGGER on_investment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION update_project_funding();

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some demo data
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES 
  ('demo-farmer-uuid', 'farmer@demo.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Demo Farmer", "role": "farmer"}'),
  ('demo-investor-uuid', 'investor@demo.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Demo Investor", "role": "investor"}'),
  ('demo-admin-uuid', 'admin@demo.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Demo Admin", "role": "admin"}');
