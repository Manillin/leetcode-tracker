# LeetCode Tracker

A modern web application for tracking LeetCode problem-solving progress and maintaining daily coding streaks.

## Overview

LeetCode Tracker is a full-stack application built with Next.js and Supabase that allows users to log their solved LeetCode problems, track consecutive coding days, and monitor their progress over time. The application features user authentication, streak management, and exercise tracking.

## Features

- **User Authentication**: Secure registration and login system with Supabase Auth
- **Exercise Tracking**: Log solved LeetCode problems with notes and completion dates
- **Streak System**: Track consecutive days of coding activity
- **Progress Analytics**: View statistics and progress over time


## Tech Stack

### Frontend
- **Next.js 14.2.30** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and lifecycle methods

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Authentication and user management
- **Row Level Security (RLS)** - Database-level security policies

### Deployment
- **Vercel** - Frontend hosting and deployment
- **Supabase Cloud** - Database and backend services


## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/leetcode-tracker.git
cd leetcode-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database

5. Start the development server:
```bash
npm run dev
```


## Usage

### User Registration
1. Navigate to the application
2. Create an account with email and password
3. Complete profile setup

### Adding Exercises
1. Click "Add Exercise" button
2. Fill in LeetCode problem details:
   - Problem number
   - Title
   - Link
   - Completion date
   - Optional notes
3. Submit to update your progress and streak

### Tracking Progress
- View total exercises solved
- Monitor current streak count
- Browse exercise history with pagination
- Edit or delete existing entries

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── profile/           # Profile dashboard
├── components/            # React components
│   └── profile/          # Profile-specific components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client configuration
└── types/                # TypeScript type definitions
```

## API Reference

The application uses Supabase's auto-generated API for database operations:

- **Authentication**: Supabase Auth API
- **Database**: Supabase PostgREST API
- **Real-time**: Supabase Realtime subscriptions


## Known Issues

- Query performance may vary based on geographic location relative to Supabase servers
- Initial load times may be slower on cold starts
