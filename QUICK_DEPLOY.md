# Quick Deploy Instructions

To push to GitHub and deploy to Vercel, run these commands from the `personal-app-stack` directory:

## Option 1: Use the deployment script

```powershell
cd personal-app-stack
.\setup-and-deploy.ps1
```

## Option 2: Manual commands

### 1. Navigate to project directory
```powershell
cd personal-app-stack
```

### 2. Initialize git (if needed)
```powershell
git init
git branch -M main
```

### 3. Add remote and push
```powershell
git remote add origin https://github.com/DENSENSE8/zipit-backend.git
git add .
git commit -m "Deploy to production"
git push -u origin main
```

### 4. Deploy to Vercel

If you have Vercel CLI installed:
```powershell
vercel --prod
```

If not, install it first:
```powershell
npm install -g vercel
vercel --prod
```

Alternatively, you can deploy via the Vercel website:
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables (if needed)
4. Deploy

## Important Notes

- Make sure you have your environment variables configured in Vercel dashboard (database URLs, API keys, etc.)
- The project uses Prisma, so you may need to run `prisma generate` and `prisma db push` in Vercel's build settings if needed

