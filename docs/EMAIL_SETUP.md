# Email Setup Guide for Password Reset

The forgot password feature requires SMTP configuration to send emails. Here are setup instructions for different email providers.

## Option 1: Gmail (Easiest for Testing)

### Steps:

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "FitTrack" as the name
   - Copy the 16-character app password (no spaces)

3. **Set SMTP Secrets on Fly.io**
   ```bash
   flyctl secrets set \
     SMTP_HOST=smtp.gmail.com \
     SMTP_PORT=587 \
     SMTP_USER=your-email@gmail.com \
     SMTP_PASSWORD=your-16-char-app-password \
     SMTP_FROM=your-email@gmail.com \
     APP_URL=https://fittrack-api.fly.dev \
     --app fittrack-api
   ```

4. **Restart the app**
   ```bash
   flyctl apps restart fittrack-api
   ```

## Option 2: SendGrid (Recommended for Production)

### Steps:

1. **Sign up for SendGrid** (free tier: 100 emails/day)
   - Go to: https://sendgrid.com/
   - Create account and verify email

2. **Create API Key**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Set SMTP Secrets**
   ```bash
   flyctl secrets set \
     SMTP_HOST=smtp.sendgrid.net \
     SMTP_PORT=587 \
     SMTP_USER=apikey \
     SMTP_PASSWORD=your-sendgrid-api-key \
     SMTP_FROM=noreply@yourdomain.com \
     APP_URL=https://fittrack-api.fly.dev \
     --app fittrack-api
   ```

4. **Restart the app**
   ```bash
   flyctl apps restart fittrack-api
   ```

## Option 3: Mailgun

1. **Sign up for Mailgun** (free tier: 5,000 emails/month)
2. **Get SMTP credentials** from Mailgun dashboard
3. **Set secrets:**
   ```bash
   flyctl secrets set \
     SMTP_HOST=smtp.mailgun.org \
     SMTP_PORT=587 \
     SMTP_USER=postmaster@your-domain.mailgun.org \
     SMTP_PASSWORD=your-mailgun-password \
     SMTP_FROM=noreply@yourdomain.com \
     APP_URL=https://fittrack-api.fly.dev \
     --app fittrack-api
   ```

## Testing

After setting up SMTP, test the forgot password:

```bash
curl -X POST https://fittrack-api.fly.dev/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

Check your email inbox for the password reset link!

## Troubleshooting

- **Check logs for email errors:**
  ```bash
  flyctl logs --app fittrack-api | grep -i "email\|smtp"
  ```

- **Verify secrets are set:**
  ```bash
  flyctl secrets list --app fittrack-api
  ```

- **Test SMTP connection:**
  ```bash
  flyctl ssh console --app fittrack-api -C "python -c 'import os; print(\"SMTP_HOST:\", os.getenv(\"SMTP_HOST\")); print(\"SMTP_USER:\", os.getenv(\"SMTP_USER\"))'"
  ```

## Current Status

Without SMTP configured, reset tokens are logged to Fly.io logs:
```bash
flyctl logs --app fittrack-api | grep "Password reset token"
```

