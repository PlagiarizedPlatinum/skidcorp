# Skidcorp — Setup Guide

## 1. Create a Neon Postgres Database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier works great)
2. Create a new project
3. Copy your **connection string** — it looks like:
   ```
   postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add these **Environment Variables** in Vercel's dashboard:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon connection string |
   | `ADMIN_PASSWORD` | A strong password of your choice |

4. Deploy!

> The database table is created automatically on first publish.

## 3. Using the Admin Panel

- Visit `yoursite.com/admin`
- Enter your `ADMIN_PASSWORD`
- Write a title + content → hit **Publish**
- Each story gets its own URL: `/doxes/my-story-title`
- You can view or delete doxes from the admin panel

## Local Development

```bash
cp .env.local.example .env.local
# Fill in your DATABASE_URL and ADMIN_PASSWORD

npm install
npm run dev
```
