# CSV Data Sources

## Overview
Both the Team Pool and Player Pool now read their data from CSV files stored in Google Drive instead of Google Sheets. This provides better version control, simpler data management, and consistency across both pools.

## Data Files

### 1. player_teams.csv (Team Pool)
**Location**: `data/player_teams.csv`
**Structure**: 2 columns (Team, Player)

```csv
Team,Player
New York Islanders,Bo
Minnesota Wild,Bo
Winnipeg Jets,Bo
Chicago Blackhawks,Bo
Florida Panthers,Dennis
Ottawa Senators,Dennis
```

**Features:**
- Each row represents one team assignment to a player
- Vertical structure (one row per team)
- Simple 2-column format
- No points column needed (fetched from NHL API)

### 2. player_skaters.csv (Player Pool)
**Location**: `data/player_skaters.csv`
**Structure**: 2 columns (Player, Skater)

```csv
Player,Skater
Bo,Draisaitl
Bo,Hagel
Bo,Kempe
Bo,Crosby
Dennis,Ovechkin
Dennis,Kucherov
```

**Features:**
- Each row represents one skater assignment to a player
- Vertical structure (one row per skater)
- Simple 2-column format
- No goals column needed (fetched from NHL API)

## CSV Parser

### Shared Module
**File**: `apps-script/src/csv_parser.js`

Both pools use the same CSV parser module with these functions:

- `parseCSVFromDrive(fileName, folderId)` - Parse CSV from Google Drive
- `parseCSVContent(csvContent)` - Parse CSV string into 2D array
- `parseCSVFromURL(url)` - Parse CSV from URL (bonus feature)
- `testCSVParsing()` - Test the parser

### Usage in Code

**Team Pool:**
```javascript
nhl_api_v2();  // Uses default "player_teams.csv"
nhl_api_v2("custom_teams.csv");  // Custom filename
nhl_api_v2("player_teams.csv", "FOLDER_ID");  // Specific folder
```

**Player Pool:**
```javascript
updatePlayerPoolStandings();  // Uses default "player_skaters.csv"
updatePlayerPoolStandings("custom_skaters.csv");  // Custom filename
updatePlayerPoolStandings("player_skaters.csv", "FOLDER_ID");  // Specific folder
```

## Setup Instructions

### 1. Upload CSV Files to Google Drive

1. Open Google Drive
2. Upload both files:
   - `data/player_teams.csv`
   - `data/player_skaters.csv`
3. Make sure they're accessible by your Google Apps Script project

### 2. Optional: Organize in Folder

For better organization, you can:
1. Create a folder in Google Drive (e.g., "Hockey Pool Data")
2. Upload CSV files to that folder
3. Get the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
4. Pass the folder ID when calling the functions

## Benefits of CSV Approach

### Version Control
✅ CSV files can be tracked in Git
✅ Easy to see changes in pull requests
✅ History of all modifications

### Simplicity
✅ Plain text format
✅ Easy to edit in any text editor
✅ No spreadsheet formatting issues

### Consistency
✅ Both pools use the same vertical structure
✅ Same CSV parser for both
✅ Predictable data format

### Portability
✅ Can be used outside of Google Sheets
✅ Easy to import/export
✅ Works with other tools

## Data Maintenance

### Updating Team Assignments

1. Edit `player_teams.csv` locally
2. Commit changes to Git
3. Upload updated file to Google Drive
4. Run `nhl_api_v2()` to update standings

### Updating Skater Assignments

1. Edit `player_skaters.csv` locally
2. Commit changes to Git
3. Upload updated file to Google Drive
4. Run `updatePlayerPoolStandings()` to update standings

## Migration from Sheets

If you were previously using Google Sheets:

### Team Pool Migration
1. Export "Teams by Player" sheet as CSV
2. Remove the Points column (if present)
3. Ensure format is: Team, Player
4. Upload to Google Drive
5. Update code to use `nhl_api_v2()`

### Player Pool Migration
1. If using horizontal format (multiple skaters per row):
   - Pivot the data to vertical format
   - One row per skater assignment
2. Ensure format is: Player, Skater
3. Upload to Google Drive
4. Update code to use `updatePlayerPoolStandings()`

## Troubleshooting

### File Not Found
**Error**: `CSV file 'player_teams.csv' not found in Google Drive`

**Solutions:**
1. Verify the file is uploaded to Google Drive
2. Check the filename matches exactly (case-sensitive)
3. If using a folder, provide the correct folder ID
4. Ensure the Apps Script project has permission to access the file

### Parse Errors
**Error**: `CSV file is empty or could not be parsed`

**Solutions:**
1. Check the CSV file has data rows (not just headers)
2. Ensure CSV format is correct (comma-separated)
3. Remove any extra empty lines at the end
4. Check for special characters or encoding issues

### Permission Issues
**Error**: Access denied or authentication errors

**Solutions:**
1. Share the CSV file with the same Google account running Apps Script
2. Or place files in your Google Drive root directory
3. Or specify the correct folder ID where files are located

## Best Practices

### File Naming
- Use descriptive, consistent names
- Keep filenames lowercase with underscores
- Include version numbers if needed (e.g., `player_teams_v2.csv`)

### Data Entry
- Always include header row
- Use consistent player/team naming
- Avoid trailing spaces
- Keep one assignment per row

### Backup
- Commit CSV files to Git regularly
- Keep backup copies in Google Drive
- Export current standings periodically

### Testing
- Test with sample data first
- Verify CSV parser with `testCSVParsing()`
- Check logs for parsing errors
- Validate team/player names match

## Example Workflow

1. **Draft Season**: Enter all team/skater assignments in CSV files
2. **Commit**: `git commit -m "Add 2024-25 pool assignments"`
3. **Upload**: Upload CSV files to Google Drive
4. **Run**: Execute `nhl_api_v2()` and `updatePlayerPoolStandings()`
5. **Review**: Check generated standings sheets
6. **Update**: Throughout season, update CSV as trades occur
7. **Re-run**: Run functions to refresh standings

## Future Enhancements

Potential improvements:
- Auto-sync CSV from GitHub to Google Drive
- Web interface for editing assignments
- Validation script to check for errors
- Batch import/export tools
- Historical data tracking in separate CSV files
