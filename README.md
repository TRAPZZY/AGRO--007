# AgroInvest - Agricultural Investment Platform

A modern, production-ready agricultural investment platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🌾 Features

- **Multi-Role Dashboard**: Separate interfaces for farmers, investors, and administrators
- **Project Management**: Create, manage, and track agricultural projects
- **Investment Tracking**: Real-time investment monitoring and portfolio management
- **KYC Verification**: Built-in document upload and verification system
- **Responsive Design**: Beautiful, mobile-first design with agricultural theming
- **Real-time Updates**: Live project progress and investment tracking
- **Secure Authentication**: Ready for Supabase Auth integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone or download the project**
   \`\`\`bash
   git clone <your-repo-url>
   cd agroinvest
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your Supabase credentials to `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Supabase Tables

Create the following tables in your Supabase dashboard:

#### Users Table
\`\`\`sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
\`\`\`

#### Projects Table
\`\`\`sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
\`\`\`

#### Investments Table
\`\`\`sql
CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  expected_return DECIMAL NOT NULL,
  actual_return DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### KYC Documents Table
\`\`\`sql
CREATE TABLE kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR CHECK (document_type IN ('id_card', 'passport', 'utility_bill', 'bank_statement')) NOT NULL,
  document_url VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Row Level Security (RLS)

Enable RLS and create policies:

\`\`\`sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can read active projects" ON projects FOR SELECT USING (status = 'active');
CREATE POLICY "Farmers can manage own projects" ON projects FOR ALL USING (auth.uid() = farmer_id);

-- Investments policies
CREATE POLICY "Investors can read own investments" ON investments FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors can create investments" ON investments FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- KYC documents policies
CREATE POLICY "Users can manage own KYC documents" ON kyc_documents FOR ALL USING (auth.uid() = user_id);
\`\`\`

## 🔧 Configuration

### Supabase Integration

1. **Install Supabase client**
   \`\`\`bash
   npm install @supabase/supabase-js
   \`\`\`

2. **Update `lib/supabase.ts`**
   \`\`\`typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   \`\`\`

3. **Set up authentication**
   - Configure Supabase Auth providers
   - Update login/signup pages to use Supabase Auth
   - Add authentication middleware

## 🎨 Theming

The application uses a beautiful agricultural theme with:
- Green gradient backgrounds
- Nature-inspired color palette
- Responsive design patterns
- Custom CSS classes for consistency

### Custom CSS Classes
- `.agro-gradient` - Green gradient backgrounds
- `.agro-card` - Styled cards with agricultural theme
- `.agro-button` - Themed buttons
- `.agro-input` - Styled form inputs

## 📱 Pages Overview

### Public Pages
- **Landing Page** (`/`) - Marketing homepage
- **Projects** (`/projects`) - Browse all projects
- **How It Works** (`/how-it-works`) - Platform explanation
- **Login/Signup** (`/login`, `/signup`) - Authentication

### Farmer Dashboard
- **Dashboard** (`/dashboard/farmer`) - Overview and stats
- **Create Project** (`/dashboard/farmer/create-project`) - Project creation
- **My Projects** (`/dashboard/farmer/my-projects`) - Project management
- **Profile** (`/dashboard/farmer/profile`) - Profile management

### Investor Dashboard
- **Dashboard** (`/dashboard/investor`) - Portfolio overview
- **Browse Projects** (`/dashboard/investor/browse-projects`) - Project discovery
- **My Investments** (`/dashboard/investor/my-investments`) - Investment tracking
- **Profile** (`/dashboard/investor/profile`) - Profile management

### Admin Dashboard
- **Dashboard** (`/dashboard/admin`) - Platform overview
- **Users** (`/dashboard/admin/users`) - User management
- **Projects** (`/dashboard/admin/projects`) - Project approval
- **KYC** (`/dashboard/admin/kyc`) - Document verification

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Environment Variables in Vercel**
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   \`\`\`

## 🔒 Security Features

- **Row Level Security** - Database-level access control
- **KYC Verification** - Document upload and verification
- **Role-based Access** - Different permissions for each user type
- **Input Validation** - Form validation and sanitization
- **HTTPS Only** - Secure data transmission

## 🧪 Testing

### Demo Accounts
The application includes demo login functionality:
- **Farmer**: `farmer@demo.com`
- **Investor**: `investor@demo.com`  
- **Admin**: `admin@demo.com`

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 License

This project is licensed under the MIT License.
