# Supabase Setup Guide

This guide will help you set up Supabase for the Money Tracker application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: money-tracker (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to finish setting up (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, click on the ⚙️ **Settings** icon
2. Go to **API** settings
3. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Configure Environment Variables

1. In your project root, create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Run Database Migrations

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- ✅ All necessary tables (profiles, accounts, categories, transactions, budgets, settings)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic timestamps
- ✅ Auto-creation of profile and settings on user signup

## Step 5: Configure Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - **Enable email confirmations**: ON (recommended for production)
   - **Secure email change**: ON
   - **Double opt-in**: ON (optional)

### Email Templates (Optional)

Customize email templates under **Authentication** → **Email Templates**:
- Confirmation email
- Magic link email  
- Password reset email

## Step 6: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signup`
3. Create a test account with your email
4. Check your email for confirmation link
5. Click the confirmation link
6. Try logging in at `http://localhost:3000/auth/login`

## Verification Checklist

- [ ] Environment variables are set correctly
- [ ] Database schema is created (check Tables in Supabase dashboard)
- [ ] RLS policies are enabled
- [ ] Email authentication is configured
- [ ] Site URL and redirect URLs are set
- [ ] Test account can sign up and log in
- [ ] Profile and settings are auto-created on signup

## Troubleshooting

### "Invalid API key" error
- Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Make sure `.env.local` file is in the project root
- Restart your development server after changing environment variables

### "Email not confirmed" error
- Check your email spam folder
- In Supabase dashboard, go to Authentication → Users
- Find your user and manually confirm the email
- Or disable email confirmation in Authentication → Providers → Email

### RLS Policy errors
- Make sure you ran the complete schema.sql file
- Check that RLS is enabled on all tables
- Verify policies exist in Supabase dashboard → Authentication → Policies

### Data not syncing
- Check browser console for errors
- Verify you're logged in (check Network tab for auth headers)
- Check Supabase logs in dashboard → Logs

## Multi-Device Sync

Once set up, data automatically syncs across devices:
- All data is stored in Supabase (cloud database)
- Each user's data is isolated by Row Level Security
- Changes are immediate (no manual sync needed)
- Works on any device where you log in

## Next Steps

- [ ] Test creating accounts, transactions, budgets
- [ ] Log in from a different device/browser
- [ ] Verify data syncs correctly
- [ ] Set up production environment variables
- [ ] Deploy to Vercel/Netlify with production Supabase project

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
