# Moming Admin - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env` in your deployment environment
- [ ] Fill in all required Supabase credentials
- [ ] Ensure `.env` is in `.gitignore` (it is by default)
- [ ] Never commit `.env` to version control

```bash
cp .env.example .env
# Edit .env with your production values
```

### 2. Database Setup
- [ ] Run Supabase migrations: `supabase db push`
- [ ] Verify RLS policies are in place
- [ ] Test authentication flow

### 3. Build Verification
```bash
npm install
npm run lint
npm run build
```

## GitHub Actions CI/CD

### Required Secrets
Add these to your GitHub repository settings (Settings → Secrets and variables → Actions):

```
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_PUBLISHABLE_KEY  # Supabase anon key
DEPLOY_HOST                # Your ECS instance IP/hostname
DEPLOY_USER                # SSH username
DEPLOY_SSH_KEY             # SSH private key for deployment
DEPLOY_PATH                # Path where app is deployed (/home/user/moming-admin)
```

### Workflows

**1. Deploy Workflow** (`.github/workflows/deploy.yml`)
- Triggered on push to `main` branch
- Runs linting and builds production assets
- Deploys to your ECS instance via SSH
- Requires all secrets to be configured

**2. Lint Workflow** (`.github/workflows/lint.yml`)
- Runs on all PRs and pushes to `main`/`develop`
- Checks for console statements
- Validates code quality with ESLint

**3. Security Workflow** (`.github/workflows/security.yml`)
- Scans for exposed secrets using TruffleHog
- Validates `.env` files aren't committed
- Checks `.gitignore` configuration

## Manual Deployment

### To ECS Instance:
```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to deployment directory
cd /home/user/moming-admin

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build production
npm run build

# Restart your application
sudo systemctl restart moming-admin
```

## Error Tracking Setup (Optional)

### Sentry Integration
1. Install: `npm install @sentry/react`
2. Sign up at [sentry.io](https://sentry.io)
3. Get your DSN from Sentry
4. Add to `.env`: `VITE_SENTRY_DSN="your-dsn"`
5. Uncomment Sentry code in `src/utils/errorTracking.ts`

### LogRocket Integration
1. Install: `npm install logrocket`
2. Sign up at [logrocket.com](https://logrocket.com)
3. Get your App ID from LogRocket
4. Add to `.env`: `VITE_LOGROCKET_APP_ID="your-app-id"`
5. Uncomment LogRocket code in `src/utils/errorTracking.ts`

## Production Monitoring

### Error Tracking
- All errors are captured by the `ErrorBoundary` component
- Errors are sent to your configured tracking service
- Check `src/utils/errorTracking.ts` for configuration

### Health Checks
Monitor these endpoints:
- Application loads correctly
- Supabase connection active
- Authentication working
- API responses valid

## Rollback Procedure

If deployment fails:
1. Check GitHub Actions logs for error details
2. SSH into server and check application logs
3. Revert to previous commit: `git revert HEAD`
4. Rebuild and restart

## Performance Optimization

### Bundle Size
Current production build: ~1.9MB (compressed: ~559KB)

Recommendations for optimization:
1. Enable code splitting for routes
2. Lazy load components
3. Optimize images in public directory
4. Remove unused dependencies

### Database Optimization
1. Add indexes to frequently queried columns
2. Review RLS policies for performance
3. Monitor query performance in Supabase dashboard

## Security Checklist

- [ ] Environment variables are not committed
- [ ] HTTPS is enabled on all endpoints
- [ ] RLS policies are properly configured
- [ ] API keys are rotated regularly
- [ ] Error tracking respects user privacy
- [ ] Sensitive data is not logged

## Support & Troubleshooting

### Build Fails
- Clear node_modules: `rm -rf node_modules && npm ci`
- Check Node.js version: `node -v` (requires 18+)
- Verify environment variables are set

### Deployment Fails
- Check SSH key permissions: `chmod 600 ~/.ssh/id_rsa`
- Verify DEPLOY_PATH exists on server
- Check server logs: `journalctl -u moming-admin -n 50`

### Application Not Starting
- Check Supabase credentials
- Verify database migrations applied
- Check browser console for errors
- Review application error tracking logs
