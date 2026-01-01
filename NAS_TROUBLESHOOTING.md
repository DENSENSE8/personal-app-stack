# Troubleshooting NAS Network Connection Issues

If you're experiencing "file not found" errors when working with files on a NAS (Network Attached Storage), try these solutions:

## Quick Fixes

### 1. Map the Network Drive
Instead of using UNC paths (`\\DENSENSE-1\...`), map the network drive to a letter:

**Using File Explorer:**
1. Open File Explorer
2. Click "This PC" in the left sidebar
3. Click "Map network drive" in the ribbon
4. Choose a drive letter (e.g., `Z:`)
5. Enter the folder path: `\\DENSENSE-1\personal_folder`
6. Check "Reconnect at sign-in" if you want it persistent
7. Click "Finish"

**Using PowerShell:**
```powershell
net use Z: \\DENSENSE-1\personal_folder
```

Then use `Z:\Michael Garisek Portoflio\personal-app-stack` instead of the UNC path.

### 2. Check Network Connectivity
```powershell
# Test if you can reach the NAS
ping DENSENSE-1

# Test if you can access the share
Test-Path "\\DENSENSE-1\personal_folder"
```

### 3. Use Credentials if Needed
If the NAS requires authentication:

```powershell
# Map with credentials
net use Z: \\DENSENSE-1\personal_folder /user:username password
```

Or use Credential Manager:
1. Press `Win + R`, type `control /name Microsoft.CredentialManager`
2. Go to "Windows Credentials"
3. Add new generic credential for `DENSENSE-1`

### 4. Fix PowerShell Execution Policy (if scripts won't run)
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 5. Work Locally Instead
For development and git operations, consider:

**Option A: Copy project to local drive**
```powershell
# Copy to local drive
xcopy "\\DENSENSE-1\personal_folder\Michael Garisek Portoflio\personal-app-stack" "C:\Projects\personal-app-stack" /E /I /H
cd C:\Projects\personal-app-stack
```

**Option B: Clone from GitHub to local drive**
```powershell
cd C:\Projects
git clone https://github.com/DENSENSE8/zipit-backend.git
cd zipit-backend
```

Then work locally and sync back to NAS when needed.

## For Git Operations Specifically

Git can have issues with network paths. Best practices:

1. **Work on a local drive** - Git performs better on local storage
2. **If you must use network path**, ensure:
   - The drive is mapped (not using UNC)
   - You have proper permissions
   - Network is stable

## For Vercel Deployment

Vercel deployment works best when:
- Project is in a local directory, OR
- Connected to a GitHub repository (recommended)
- You push to GitHub first, then deploy from there

## Recommended Workflow

1. **Development**: Work on local drive (`C:\Projects\personal-app-stack`)
2. **Storage**: Keep backup/sync on NAS (`\\DENSENSE-1\...`)
3. **Version Control**: Push to GitHub
4. **Deployment**: Deploy from GitHub to Vercel

This avoids network path issues entirely.

