# Email Setup Guide for Rating Emails

## Problem
The rating emails after downloads are not being sent because the email environment variables are not configured.

## Solution

You need to add email configuration environment variables to your Vercel project. Choose one of the options below:

---

## Option 1: Gmail SMTP (Recommended & Free)

### Step 1: Generate Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 2: Add to Vercel Environment Variables
Go to your Vercel project → **Settings** → **Environment Variables** and add:

```
FROM_EMAIL=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_SECURE=false
RATING_TOKEN_SECRET=any-random-long-string-here
```

---

## Option 2: Outlook/Hotmail SMTP (Free)

### Add to Vercel Environment Variables:
```
FROM_EMAIL=your-email@outlook.com
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-outlook-password
SMTP_SECURE=false
RATING_TOKEN_SECRET=any-random-long-string-here
```

---

## Option 3: SendGrid (More reliable for production)

### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com/ (Free tier: 100 emails/day)
2. Go to **Settings** → **API Keys**
3. Create a new API key with "Full Access"
4. Copy the API key

### Step 2: Verify Sender Email
1. Go to **Settings** → **Sender Authentication**
2. Verify your email address

### Step 3: Add to Vercel Environment Variables
```
FROM_EMAIL=your-verified-email@domain.com
SENDGRID_API_KEY=your-sendgrid-api-key
RATING_TOKEN_SECRET=any-random-long-string-here
```

---

## Important Notes

1. **RATING_TOKEN_SECRET**: Generate a random string (at least 32 characters). You can use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Select all environments** when adding variables in Vercel:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. **Redeploy** after adding environment variables for changes to take effect

---

## Testing

After setting up environment variables and redeploying:

1. Go to your live site
2. Download a course resource
3. Check your email inbox for the rating request email
4. Check Vercel logs for email sending confirmation:
   - Look for: `✅ Rating email sent via SMTP to: ...`
   - Or: `✅ Rating email sent via SendGrid to: ...`

---

## Troubleshooting

### Email not received?
1. Check spam/junk folder
2. Check Vercel function logs for errors
3. Verify all environment variables are set correctly
4. Make sure you redeployed after adding variables

### "No SMTP or SendGrid configured" in logs?
- Environment variables are missing or misspelled
- Redeploy after adding variables

### Gmail not working?
- Make sure 2-Step Verification is enabled
- Use App Password, not your regular password
- Try "Less secure app access" if app password doesn't work

---

## How It Works

When a user downloads a resource:
1. Download count is incremented
2. System checks if this is the user's first download of that resource
3. If yes, sends a rating request email with a secure link
4. Email includes a link to `/rate/[courseId]?token=...`
5. User clicks link and can rate the course
