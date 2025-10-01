# 🚀 Quick Setup - Rating System

## Step 1: Add to Your .env.local File

Copy and paste these lines to your `.env.local` file:

```bash
# Rating System - REQUIRED
RATING_TOKEN_SECRET=3eac3876ee493b672a82ee3d112af3625fd20f7e3b34d8894a0388118ac1ddc3
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration - Choose Gmail OR SendGrid

# Option A: Gmail (Easiest)
FROM_EMAIL=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Option B: SendGrid (Uncomment if using SendGrid instead)
# FROM_EMAIL=your-email@example.com
# SENDGRID_API_KEY=your-sendgrid-api-key
```

---

## Step 2: Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Factor Authentication** (required)
3. Search for "**App passwords**"
4. Select **Mail** and your device
5. Copy the **16-character password**
6. Paste it as `SMTP_PASS` in your `.env.local`

---

## Step 3: Test It Works

Open your browser and go to:
```
http://localhost:3000/api/test-email?to=your-email@example.com
```

You should get an email within 30 seconds! ✅

---

## Step 4: Test the Full Flow

1. Go to `/dashboard/courses`
2. Download any course resource
3. Check your email (arrives immediately!)
4. Click "Rate This Course"
5. Submit your rating

---

## That's It! 🎉

Your rating system now:
- ✅ Sends emails immediately after download
- ✅ Uses secure tokens (no exposed user IDs)
- ✅ Has a beautiful rating page
- ✅ Is production-ready

---

## If Emails Don't Work

### Check test endpoint first:
```
http://localhost:3000/api/test-email?to=your-email@example.com
```

### Common issues:
- **Gmail:** You MUST use an App Password (not your regular password)
- **2FA:** Must be enabled on your Google account
- **Spam:** Check your spam folder
- **Wrong email:** Make sure FROM_EMAIL matches your Gmail address

---

## Environment Variables You Need

### Required (3 variables):
1. `RATING_TOKEN_SECRET` - Already generated: `3eac3876ee493b672a82ee3d112af3625fd20f7e3b34d8894a0388118ac1ddc3`
2. `NEXT_PUBLIC_SITE_URL` - Your site URL (use `http://localhost:3000` for dev)
3. `FROM_EMAIL` - Your email address

### Email Method (choose ONE):

**Gmail (4 variables):**
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=your-email@gmail.com`
- `SMTP_PASS=your-app-password` (16 characters from Google)

**OR SendGrid (1 variable):**
- `SENDGRID_API_KEY=your-api-key`

---

## What Changed?

### Removed (Old System):
- ❌ `/app/api/ratings/submit/route.ts` - Deleted
- ❌ `/app/api/reminders/process/route.ts` - No longer needed
- ❌ 24-hour scheduling - Gone
- ❌ Cron job requirement - Gone

### Added (New System):
- ✅ `/app/rate/[courseId]/page.tsx` - Beautiful rating page
- ✅ `/app/api/test-email/route.ts` - Test endpoint
- ✅ Immediate email sending - No waiting!
- ✅ Secure token authentication

---

## Production Deployment

When deploying to production:

1. **Update these in your hosting provider's environment variables:**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   FROM_EMAIL=noreply@your-domain.com
   ```

2. **Consider using SendGrid instead of Gmail** (more reliable for production)

3. **Your RATING_TOKEN_SECRET is already production-ready** (don't change it)

---

## Done! 🎉

Run your app and test downloading a course resource!
