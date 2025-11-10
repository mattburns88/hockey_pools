# NHL Player Pool System

## Overview
The player pool system tracks individual NHL skaters drafted by pool participants and calculates standings based on goal totals. The top 4 goal scorers for each player count toward their total score.

## Directory Structure
```
apps-script/src/nhl_player_pool/
├── player_name_mapper.js        # Player name normalization and aliases
├── nhl_player_api.js            # NHL API integration for player stats
├── player_pool_logic.js         # Pool calculation and standings generation
└── nhl_player_pool_main.js      # Main entry point function
```

## How It Works

### 1. Data Source
- **File**: `data/player_skaters.csv` (stored in Google Drive)
- **Structure**: Vertical layout
  - Column A: Player (pool participant name)
  - Column B: Skater (NHL player name)

**Example:**
| Player | Skater     |
|--------|------------|
| Bo     | Draisaitl  |
| Bo     | Hagel      |
| Bo     | Kempe      |
| Bo     | Crosby     |
| Dennis | Ovechkin   |
| Dennis | Kucherov   |
| Dennis | Scheifele  |

### 2. Player Name Matching
The system normalizes various player name formats using `player_name_mapper.js`:

**Supported formats:**
- Last name only: `"Draisaitl"` → `"Leon Draisaitl"`
- Full name: `"Connor McDavid"` → `"Connor McDavid"`
- Nicknames: `"J Hughes"` → `"Jack Hughes"`
- With trailing spaces: `"Marchand "` → `"Brad Marchand"`

### 3. NHL API Integration
Fetches current season (2024-2025) goal statistics from:
```
https://api-web.nhle.com/v1/skater-stats-leaders/20242025/2?categories=goals&limit=150
```

The API returns:
- Player full name (first + last)
- Current goal total
- Team information
- Player position

### 4. Pool Calculation
- Fetches goal totals for all skaters in the pool
- Sorts each player's skaters by goals (descending)
- Calculates "Top 4 Total" using the 4 highest-scoring skaters
- Ranks pool participants by their Top 4 Total

### 5. Output Sheet
**Sheet Name**: "Player Pool Standings"

**Format:**
| Player | Top 4 Total | Skater 1 🟢 | Skater 2 🟢 | Skater 3 🟢 | Skater 4 🟢 | Skater 5 | Skater 6 |
|--------|-------------|-------------|-------------|-------------|-------------|----------|----------|
| Bo     | 142         | Leon Draisaitl: 52 | Adrian Kempe: 35 | Brandon Hagel: 30 | Seth Jarvis: 25 | Martin Necas: 20 | Sidney Crosby: 18 |

*(🟢 = Light green highlighted cells indicating top 4 counted skaters)*

**Formatting:**
- ✅ 12pt font for readability
- ✅ Blue header row with white text
- ✅ Top 4 skaters highlighted in light green (`#d9ead3`)
- ✅ Top 4 Total formatted as numbers with right alignment
- ✅ Frozen header row for scrolling
- ✅ Auto-resized columns

## Usage

### Setup
1. Upload `data/player_skaters.csv` to your Google Drive
2. Make sure the CSV file is accessible by the Apps Script project

### Running the Update
To update the player pool standings with current NHL data:

```javascript
updatePlayerPoolStandings();
```

**With custom CSV file name:**
```javascript
updatePlayerPoolStandings("my_custom_skaters.csv");
```

**With specific folder ID:**
```javascript
updatePlayerPoolStandings("player_skaters.csv", "YOUR_FOLDER_ID");
```

This function will:
1. Read player-skater mappings from CSV file in Google Drive
2. Fetch current goal totals from NHL API
3. Calculate pool standings
4. Create/update "Player Pool Standings" sheet

### Testing
To test the system without updating the sheet:

```javascript
testPlayerPoolSystem();
```

This will test:
- Player name normalization
- NHL API connectivity
- Goal data retrieval

## Adding New Players

To add support for new NHL players not in the mapper:

1. Open `player_name_mapper.js`
2. Add entries to `PLAYER_ALIASES` object:

```javascript
"LastName": "FirstName LastName",
"FirstName LastName": "FirstName LastName"
```

**Example:**
```javascript
"Bedard": "Connor Bedard",
"Connor Bedard": "Connor Bedard",
"C Bedard": "Connor Bedard"  // Additional alias
```

## Files Reference

### player_name_mapper.js
- `normalizePlayerName(playerName)` - Converts any format to "FirstName LastName"
- `getAllMappedPlayers()` - Returns list of all mapped players
- `testPlayerNameNormalization()` - Test function

### nhl_player_api.js
- `fetchPlayerGoals(limit)` - Fetches top N goal scorers from NHL API
- `getGoalsForPlayers(playerNames)` - Gets goals for specific players
- `testFetchPlayerGoals()` - Test function

### player_pool_logic.js
- `calculatePlayerPoolStandings(sheet, playerGoalsMap)` - Main calculation logic
- `formatPlayerPoolStandingsSheet(sheet, numRows)` - Formatting function

### nhl_player_pool_main.js
- `updatePlayerPoolStandings(csvFileName, folderId)` - Main entry point (reads from CSV)
- `testPlayerPoolSystem()` - System test function

### csv_parser.js
- `parseCSVFromDrive(fileName, folderId)` - Parse CSV from Google Drive
- `parseCSVContent(csvContent)` - Parse CSV string into 2D array
- `parseCSVFromURL(url)` - Parse CSV from URL
- `testCSVParsing()` - Test CSV parsing

## Troubleshooting

### "Player not found in top 150 scorers"
**Cause**: Player has fewer goals than the 150th ranked player
**Solution**: The player will default to 0 goals, or increase the limit in `getGoalsForPlayers()`

### "Skater 'X' not found in NHL data"
**Cause**: Player name doesn't match any alias
**Solution**: Add the player name to `PLAYER_ALIASES` in `player_name_mapper.js`

### "CSV file 'player_skaters.csv' not found in Google Drive"
**Cause**: CSV file is not uploaded to Google Drive
**Solution**: Upload the `player_skaters.csv` file to your Google Drive (or specify correct folder ID)

## Differences from Team Pool

| Feature | Team Pool | Player Pool |
|---------|-----------|-------------|
| **Data Source** | Google Sheet (vertical rows) | CSV file in Google Drive (vertical rows) |
| **Data Structure** | Vertical (rows) | Vertical (rows) |
| **Scoring** | Team points | Player goals |
| **Top N** | Top 3 teams | Top 4 skaters |
| **Output Sheet** | "Pool Standings" | "Player Pool Standings" |
| **Highlight Color** | Light green (top 3) | Light green (top 4) |
| **Mapper File** | `team_name_mapper.js` | `player_name_mapper.js` |
| **Data Reading** | Direct sheet access | CSV parser from Drive |

## Future Enhancements

Potential improvements:
- Support for assists in addition to goals
- Multi-stat scoring (goals + assists)
- Historical tracking over time
- Weekly updates and trend analysis
- Support for goalies (separate category)
