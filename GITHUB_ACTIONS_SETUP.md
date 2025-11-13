# GitHub Actions Setup Guide

## Quick Start

### 1. Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets (all required for deployment):

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
DEPLOY_HOST
DEPLOY_USER
DEPLOY_SSH_KEY
DEPLOY_PATH
```

**Example Values:**
- `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key
- `DEPLOY_HOST`: Your ECS instance IP (e.g., `203.0.113.1`)
- `DEPLOY_USER`: SSH username (e.g., `ubuntu`)
- `DEPLOY_SSH_KEY`: Your private SSH key (without passphrase recommended)
- `DEPLOY_PATH`: Deployment directory (e.g., `/home/ubuntu/moming-admin`)

### 2. Verify Workflows Are Active
- Go to Actions tab in your repository
- You should see three workflows:
  - **Build and Deploy** - Runs on push to main
  - **Code Quality** - Runs on PR/push to main/develop
  - **Security Checks** - Runs on push to main

## Detailed Setup

### Setting SSH Key for Deployment

1. Generate SSH key (if you don't have one):
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/moming-deploy -N ""
```

2. Add public key to your ECS instance:
```bash
ssh-copy-id -i ~/.ssh/moming-deploy.pub user@your-server-ip
```

3. Add private key to GitHub Secrets as `DEPLOY_SSH_KEY`:
```bash
cat ~/.ssh/moming-deploy | pbcopy  # macOS
cat ~/.ssh/moming-deploy | xclip -selection clipboard  # Linux
```

### ECS Instance Preparation

1. SSH into your server:
```bash
ssh user@your-server-ip
```

2. Install Node.js and npm:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Create deployment directory:
```bash
mkdir -p /home/user/moming-admin
cd /home/user/moming-admin
git clone <your-repo-url> .
npm ci
npm run build
```

4. Create systemd service (optional but recommended):
```bash
sudo nano /etc/systemd/system/moming-admin.service
```

Add:
```ini
[Unit]
Description=Moming Admin Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/moming-admin
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

5. Enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable moming-admin
sudo systemctl start moming-admin
```

## Workflow Details

### 1. Build and Deploy Workflow
**File:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Steps:**
1. Checkout code
2. Setup Node.js 18.x
3. Install dependencies (`npm ci`)
4. Run linter (`npm run lint`)
5. Build production (`npm run build`)
6. Upload artifacts (retained for 5 days)
7. Deploy to ECS (only on push to main)

**Notes:**
- Linter failures don't stop deployment
- Build must succeed to deploy
- Deployment only happens on main branch pushes

### 2. Code Quality Workflow
**File:** `.github/workflows/lint.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Checks:**
- ESLint code quality
- Console statement detection
- Warns about console statements (non-blocking)

### 3. Security Workflow
**File:** `.github/workflows/security.yml`

**Triggers:**
- Push to `main`
- Pull requests to `main`

**Checks:**
- TruffleHog secret scanning
- Verifies .env files aren't committed
- Validates .gitignore configuration

**Fails if:**
- Secrets are detected in code
- .env files are present in git

## Testing Workflows

### Test Build Locally
```bash
npm install
npm run lint
npm run build
```

### Simulate Deployment
1. Push to a feature branch first
2. Create a PR to see if linting passes
3. When confident, push to `main` to trigger full pipeline

### Monitor Workflow Progress
1. Go to Actions tab
2. Click on the workflow run
3. View logs for each step
4. Check artifact uploads

## Troubleshooting

### Deployment Fails with SSH Error
- Verify `DEPLOY_SSH_KEY` is properly formatted (includes `-----BEGIN RSA PRIVATE KEY-----`)
- Ensure key is on single line (GitHub secrets strip newlines automatically)
- Check `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` are correct

### Build Fails
- Check build logs in GitHub Actions
- Verify environment variables are set
- Try running `npm run build` locally to debug

### Linter Errors Block Deployment
- Fix errors shown in workflow logs
- Run `npm run lint` locally to find issues
- Commit fixes and push again

### Secrets Not Working
- Ensure secrets are added to the correct repository (not organization-level)
- Secrets are case-sensitive
- Re-save secrets if you changed them

## Best Practices

1. **Never commit secrets** to git (use environment variables)
2. **Always use SSH keys without passphrases** for CI/CD
3. **Test locally before pushing** to main
4. **Monitor deployment logs** for errors
5. **Keep Node.js version updated** (currently 18.x)
6. **Review security scan results** regularly
7. **Rotate SSH keys** periodically

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/managing-envs)
- [ECS Instance Setup](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-basics.html)
- [Node.js in CI/CD](https://nodejs.org/en/docs/)
