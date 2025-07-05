-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable update for users based on farmer_id" ON projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON investments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON investments;
DROP POLICY IF EXISTS "Enable update for users based on investor_id" ON investments;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'investor'),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Projects table policies
CREATE POLICY "Anyone can view active projects" ON projects
  FOR SELECT USING (status = 'active' OR auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Service role can manage projects" ON projects
  FOR ALL USING (auth.role() = 'service_role');

-- Investments table policies
CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = investor_id OR auth.uid() IN (
    SELECT farmer_id FROM projects WHERE id = project_id
  ));

CREATE POLICY "Investors can insert investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Users can update own investments" ON investments
  FOR UPDATE USING (auth.uid() = investor_id);

CREATE POLICY "Service role can manage investments" ON investments
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_farmer_id ON projects(farmer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_investments_investor_id ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON investments(project_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert demo data if not exists
INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES
  ('demo-farmer-id', 'farmer@demo.com', 'Demo Farmer', 'farmer', now(), now()),
  ('demo-investor-id', 'investor@demo.com', 'Demo Investor', 'investor', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert demo projects
INSERT INTO projects (
  id, title, description, farmer_id, category, location, funding_goal, 
  amount_raised, status, expected_return, min_investment, risk_level,
  image_url, created_at, updated_at
) VALUES
  (
    'demo-project-1',
    'Organic Rice Farming Initiative',
    'Sustainable rice farming project using organic methods to produce high-quality rice for local and export markets.',
    'demo-farmer-id',
    'crops',
    'Kebbi State, Nigeria',
    2000000,
    750000,
    'active',
    15.5,
    50000,
    'low',
    '/images/rice-farming.png',
    now(),
    now()
  ),
  (
    'demo-project-2',
    'Modern Poultry Farm Expansion',
    'Expanding our poultry operations with modern equipment and facilities to increase egg and meat production.',
    'demo-farmer-id',
    'poultry',
    'Ogun State, Nigeria',
    1500000,
    900000,
    'active',
    18.0,
    25000,
    'medium',
    '/images/poultry-farm.png',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert demo investments
INSERT INTO investments (
  id, investor_id, project_id, amount, expected_return, status, created_at, updated_at
) VALUES
  ('demo-investment-1', 'demo-investor-id', 'demo-project-1', 100000, 15.5, 'active', now(), now()),
  ('demo-investment-2', 'demo-investor-id', 'demo-project-2', 75000, 18.0, 'active', now(), now())
ON CONFLICT (id) DO NOTHING;
