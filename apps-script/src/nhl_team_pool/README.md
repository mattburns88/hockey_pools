# Apps Script Implementation

Google Apps Script implementation of the NHL Hockey Pool.

## Files

- `src/nhl_api.js` - Main script that fetches NHL standings and calculates pool rankings
- `src/pool_logic.js` - Pool calculation logic (separated for clarity)
- `appsscript.json` - Apps Script manifest file

## Setup

1. **Link to your Google Sheets:**
   - Update the spreadsheet URL in `nhl_api.js`
   - Or use `SpreadsheetApp.getActiveSpreadsheet()` if running from the sheet

2. **Install clasp** (if not already installed):
   ```bash
   npm install -g @google/clasp
   ```

3. **Login:**
   ```bash
   clasp login
   ```

4. **Clone your existing script:**
   ```bash
   clasp clone YOUR_SCRIPT_ID
   ```
   
   To find your Script ID:
   - Open your Google Sheet
   - Extensions → Apps Script
   - Project Settings (gear icon) → Script ID

## Development Workflow

### Editing locally:
1. Edit files in `src/`
2. Push to Apps Script: `clasp push`
3. Test in Google Sheets

### Pulling changes:
If you make changes in the web editor:
```bash
clasp pull
```

### Auto-push on save:
```bash
clasp push --watch
```

## Google Sheets Configuration

### Required Sheets:

1. **Teams by Player**
   - Column A: Player Name
   - Columns B+: Team Names (as many as needed)

2. **NHL_API_Standings** (auto-generated)
   - Raw data from NHL API

3. **Pool Standings** (auto-generated)
   - Calculated rankings

## Troubleshooting

### Team names don't match
If team names in your "Teams by Player" sheet don't match the API exactly:
- Check the API response in the logs
- Use exact team names like "Toronto Maple Leafs", "Montréal Canadiens"

### Script doesn't run
- Check Apps Script execution logs: Extensions → Apps Script → Executions
- Ensure you have edit permissions on the spreadsheet
- Verify the spreadsheet URL is correct

## NHL API

Currently using: `https://api-web.nhle.com/v1/standings/now`

This endpoint provides real-time standings with:
- Conference and division info
- Team names
- Points totals
- Games played, wins, losses, etc.
