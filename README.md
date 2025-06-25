# 🎯 Green Money Tracker (BetTracker Pro)

A professional sports betting tracker application built with React, TypeScript, and Supabase. Track your bets, analyze performance, and optimize your betting strategies with advanced analytics and bankroll management tools.

![BetTracker Pro](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.50.0-green)

## ✨ Features

### 🎲 Core Betting Features
- **Complete Bet Tracking**: Record all your bets with detailed information
- **Multi-Sport Support**: Track bets across different sports and events
- **Advanced Bet Types**: Support for singles, multiples, systems, and exchange bets
- **Real-time Status Updates**: Track pending, won, lost, and cashout bets
- **Tipster Management**: Track performance by different tipsters

### 📊 Analytics & Insights
- **Performance Dashboard**: Real-time overview of your betting performance
- **ROI Analysis**: Calculate and track Return on Investment
- **Win Rate Statistics**: Monitor your success rate over time
- **Monthly Reports**: Detailed monthly performance breakdowns
- **Profit/Loss Tracking**: Comprehensive P&L analysis

### 💰 Bankroll Management
- **Stake Tracking**: Monitor total stakes and individual bet amounts
- **Profit Optimization**: Identify most profitable strategies
- **Risk Management**: Track liability and commission for exchange bets
- **Budget Control**: Set and monitor betting budgets

### 🔐 Security & User Management
- **Secure Authentication**: Supabase Auth with email/password
- **User Profiles**: Personalized user experience with custom nicknames
- **Data Protection**: Encrypted data storage and secure API calls
- **Multi-User Support**: Each user has their own private betting data

### 📱 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Beautiful gradient-based design system
- **Intuitive Navigation**: Sidebar navigation with quick access to all features
- **Real-time Updates**: Instant data synchronization across devices

### 📈 Export & Reporting
- **PDF Export**: Generate professional betting reports
- **Excel Export**: Export data for external analysis
- **Archive System**: Organize and filter historical bets
- **Detailed Analytics**: Comprehensive charts and graphs

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Headless UI primitives
- **React Router** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **PostgreSQL** - Reliable relational database
- **Row Level Security** - Data protection at the database level
- **Real-time Subscriptions** - Live data updates

### Data Visualization & Export
- **Recharts** - Beautiful charts and graphs
- **jsPDF** - PDF generation
- **XLSX** - Excel file export
- **html2canvas** - Screenshot functionality for reports

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/green-money-tracker.git
   cd green-money-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   ```bash
   # Navigate to supabase directory
   cd supabase
   
   # Start Supabase locally (optional)
   supabase start
   
   # Apply migrations
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
green-money-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── AppSidebar.tsx  # Main navigation sidebar
│   │   ├── UserMenu.tsx    # User profile menu
│   │   └── ...             # Other components
│   ├── pages/              # Application pages
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── AddBet.tsx      # Add new bet form
│   │   ├── Archive.tsx     # Bet history and filtering
│   │   ├── Analysis.tsx    # Analytics and charts
│   │   ├── Profile.tsx     # User profile management
│   │   └── Auth.tsx        # Authentication pages
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── integrations/       # External service integrations
│   └── lib/                # Library configurations
├── supabase/               # Database migrations and config
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## 🎯 Usage Guide

### 1. Getting Started
1. **Sign up** for a new account or **sign in** with existing credentials
2. **Complete your profile** with your preferred nickname
3. **Start tracking** your first bet using the "Add Bet" feature

### 2. Adding Bets
- Navigate to **Add Bet** from the sidebar
- Fill in all required fields:
  - **Sport**: Select the sport category
  - **Event**: Describe the event/match
  - **Bet Type**: Choose from single, multiple, system, etc.
  - **Odds**: Enter the decimal odds
  - **Stake**: Amount you're betting
  - **Status**: Current bet status (pending/won/lost/cashout)
- Add optional details like notes, tipster, or bookmaker
- Save your bet

### 3. Dashboard Overview
The dashboard provides key metrics:
- **Total Profit**: Your overall profit/loss
- **Total Stake**: Sum of all your bets
- **Win Rate**: Percentage of winning bets
- **Monthly Activity**: Bets placed this month

### 4. Analytics & Reports
- **Analysis Page**: View detailed charts and performance metrics
- **Archive Page**: Filter and search through historical bets
- **Export Options**: Download PDF reports or Excel files

### 5. Profile Management
- Update your personal information
- Change your nickname
- Manage account settings

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Schema
The application uses the following main tables:
- `profiles` - User profile information
- `bets` - Betting records with all details
- `auth.users` - Supabase authentication users

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual Deployment
```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the code comments and TypeScript types
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for help and ideas

## 🙏 Acknowledgments

- **Shadcn/ui** for the beautiful component library
- **Supabase** for the excellent backend-as-a-service platform
- **Vite** for the fast development experience
- **Tailwind CSS** for the utility-first styling approach

---

