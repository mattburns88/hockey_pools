# Syncing CSV Files to Google Drive

## Overview
There are multiple ways to automatically sync your CSV files from your local repository or GitHub to Google Drive, eliminating the need for manual uploads.

## Option 1: GitHub Sync (Recommended)

### Setup

1. **Update Configuration** in `sync_csv_from_github.js`:
   ```javascript
   var GITHUB_CONFIG = {
     owner: "mattb",  // Your GitHub username
     repo: "hockey_pools",
     branch: "main",

     files: [
       {
         githubPath: "data/player_teams.csv",
         driveName: "player_teams.csv",
         folderId: null  // Or your folder ID
       },
       {
         githubPath: "data/player_skaters.csv",
         driveName: "player_skaters.csv",
         folderId: null
       }
     ]
   };
   ```

2. **Test Connection**:
   ```javascript
   testGitHubConnection();
   ```

3. **Manual Sync**:
   ```javascript
   syncCSVFromGitHub();
   ```

4. **Set Up Automatic Daily Sync**:
   ```javascript
   setupDailySync();  // Syncs daily at 6 AM
   ```

### How It Works

1. Apps Script fetches CSV files from GitHub raw URLs
2. Checks if files already exist in Google Drive
3. Updates existing files or creates new ones
4. Can run on a schedule (daily, hourly, etc.)

### Advantages

✅ **Automatic** - Set it and forget it
✅ **Version control** - Always syncs from Git
✅ **No manual uploads** - Completely automated
✅ **Scheduled** - Can run on any schedule
✅ **Free** - Uses GitHub raw URLs (public repos)

### Limitations

⚠️ **Public repos only** (or requires GitHub token for private)
⚠️ **Requires push to GitHub** first
⚠️ **Small delay** between Git push and sync

## Option 2: Clasp Upload

### Setup

1. **Create `.claspignore` file** (already created):
   ```
   node_modules/
   .git/
   docs/
   !data/
   ```

2. **Push with data files**:
   ```bash
   clasp push
   ```

### How It Works

- Clasp uploads specified files when you run `clasp push`
- Files are uploaded to Apps Script project
- Apps Script can then access them as resources

### Advantages

✅ **Simple** - Just `clasp push`
✅ **Local files** - No GitHub push needed
✅ **Fast** - Immediate upload

### Limitations

⚠️ **Manual** - Must run `clasp push` each time
⚠️ **Apps Script storage** - Not traditional Google Drive
⚠️ **Access limitations** - Different API to access files

## Option 3: Google Drive Desktop App

### Setup

1. **Install Google Drive for Desktop**
2. **Place CSV files in synced folder**:
   ```
   ~/Google Drive/Hockey Pool Data/
     - player_teams.csv
     - player_skaters.csv
   ```

3. **Update code to use synced folder**:
   ```javascript
   var DRIVE_FOLDER_ID = "YOUR_SYNCED_FOLDER_ID";
   nhl_api_v2("player_teams.csv", DRIVE_FOLDER_ID);
   ```

### How It Works

- Google Drive Desktop syncs files automatically
- Any local changes sync to Drive immediately
- Apps Script reads from Drive folder

### Advantages

✅ **Automatic** - Real-time sync
✅ **Simple** - No code needed
✅ **Bidirectional** - Can edit in Drive or locally
✅ **Fast** - Instant sync

### Limitations

⚠️ **Requires desktop app** - Must be installed
⚠️ **Local dependency** - Computer must be on
⚠️ **Folder structure** - Must maintain specific paths

## Option 4: GitHub Actions Workflow

For advanced users, automate GitHub → Drive sync with Actions:

### Setup

Create `.github/workflows/sync-to-drive.yml`:

```yaml
name: Sync CSV to Google Drive

on:
  push:
    paths:
      - 'data/**.csv'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Sync to Google Drive
        env:
          DRIVE_CREDENTIALS: ${{ secrets.DRIVE_CREDENTIALS }}
        run: |
          # Script to upload to Drive using API
          # Requires Drive API credentials
```

### Advantages

✅ **Fully automated** - Triggered on Git push
✅ **No manual steps** - Completely hands-off
✅ **Fast** - Runs immediately after push

### Limitations

⚠️ **Complex setup** - Requires API credentials
⚠️ **Advanced** - GitHub Actions knowledge needed
⚠️ **API limits** - Subject to Drive API quotas

## Recommended Workflow

### For Development

1. **Edit CSV locally** in your IDE
2. **Commit to Git**: `git commit -m "Update team assignments"`
3. **Push to GitHub**: `git push`
4. **Apps Script auto-syncs** (if Option 1 is set up)

Or use Google Drive Desktop (Option 3) for instant sync during development.

### For Production

Use **Option 1 (GitHub Sync)** with daily trigger:

```javascript
setupDailySync();  // Run once to set up
```

This ensures Drive always has the latest data from your repository.

## Setup Guide: Option 1 (Detailed)

### Step 1: Configure GitHub Sync

1. Open `sync_csv_from_github.js` in Apps Script editor
2. Update `GITHUB_CONFIG`:
   ```javascript
   owner: "mattb",  // YOUR username
   repo: "hockey_pools",  // YOUR repo name
   branch: "main"  // YOUR default branch
   ```

3. Optionally create a Drive folder:
   - Create folder "Hockey Pool Data" in Drive
   - Copy folder ID from URL: `.../folders/FOLDER_ID_HERE`
   - Update `folderId` in config

### Step 2: Test the Connection

Run in Apps Script:
```javascript
testGitHubConnection();
```

Check logs for success message and preview of downloaded data.

### Step 3: Manual Sync Test

Run:
```javascript
syncCSVFromGitHub();
```

Check Google Drive - files should appear!

### Step 4: Set Up Automatic Sync

Run:
```javascript
setupDailySync();
```

Check triggers in Apps Script:
- Click clock icon (Triggers)
- Should see `syncCSVFromGitHub` trigger
- Set to run daily at 6 AM

### Step 5: Update Your Code

Update pool functions to use the Drive folder (if you created one):

```javascript
// Team pool
nhl_api_v2("player_teams.csv", "YOUR_FOLDER_ID");

// Player pool
updatePlayerPoolStandings("player_skaters.csv", "YOUR_FOLDER_ID");
```

## Troubleshooting

### "Failed to fetch from GitHub"

**Causes:**
- Repository is private (requires token)
- Incorrect owner/repo/branch name
- File path is wrong
- Network issues

**Solutions:**
1. Verify GitHub URL in browser
2. Check repository is public
3. Confirm file exists at specified path
4. For private repos, add GitHub token

### "File not found in Drive"

**Cause:** Sync hasn't run yet or failed

**Solutions:**
1. Run `syncCSVFromGitHub()` manually
2. Check Apps Script logs for errors
3. Verify Drive permissions

### "Rate limit exceeded"

**Cause:** Too many API calls

**Solutions:**
1. Don't sync too frequently
2. Use daily trigger instead of hourly
3. Add caching logic

## Best Practices

### File Organization

Create a dedicated Drive folder:
```
Hockey Pool Data/
  ├── player_teams.csv
  ├── player_skaters.csv
  └── archive/
      ├── player_teams_2024.csv
      └── player_skaters_2024.csv
```

### Version Control

Keep old versions in archive folder:
```javascript
// Before updating, archive current version
function archiveCurrentFiles() {
  var sourceFolder = DriveApp.getFolderById("SOURCE_FOLDER_ID");
  var archiveFolder = DriveApp.getFolderById("ARCHIVE_FOLDER_ID");

  var files = sourceFolder.getFilesByName("player_teams.csv");
  if (files.hasNext()) {
    var file = files.next();
    var dateSuffix = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");
    file.makeCopy("player_teams_" + dateSuffix + ".csv", archiveFolder);
  }
}
```

### Testing

Always test sync with sample data first:
1. Create test files in Git
2. Point sync to test folder in Drive
3. Verify sync works correctly
4. Then switch to production files

### Monitoring

Set up email notifications for sync failures:
```javascript
function syncCSVFromGitHub() {
  try {
    // ... sync code ...
  } catch (error) {
    // Send email on failure
    MailApp.sendEmail({
      to: "your-email@example.com",
      subject: "CSV Sync Failed",
      body: "Error: " + error.toString()
    });
    throw error;
  }
}
```

## Security Notes

### For Public Repositories

- Files are publicly accessible via raw URLs
- Anyone can see your team assignments
- Consider if this is acceptable

### For Private Repositories

- Need GitHub Personal Access Token
- Add token to script properties
- Use Apps Script's PropertiesService

Example:
```javascript
var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
var response = UrlFetchApp.fetch(githubUrl, {
  headers: {
    'Authorization': 'token ' + token
  }
});
```

### Drive Permissions

- Ensure Apps Script has Drive permissions
- Check file sharing settings
- Use folder IDs instead of names for security

## Summary

**Easiest**: Option 3 (Google Drive Desktop)
**Most Automated**: Option 1 (GitHub Sync with trigger)
**Simplest**: Option 2 (Clasp upload)
**Most Advanced**: Option 4 (GitHub Actions)

Choose based on your workflow and technical comfort level!
