# NHL Team Name Matching System

## Overview
The team name matching system automatically normalizes various team name formats (abbreviations, full names, nicknames) to match the official NHL API format.

## How It Works

### 1. Team Name Mapper (`team_name_mapper.js`)
This file provides the `normalizeTeamName()` function that converts any team name variation into the official NHL API format.

**Supported formats:**
- **Abbreviations**: TOR, MTL, VGK, etc.
- **Full names**: Toronto Maple Leafs, Montreal Canadiens, etc.
- **Nicknames**: Leafs, Habs, Bolts, etc.
- **Variations**: Montreal Canadiens (without accent), St Louis Blues (without period), etc.

### 2. Updated Pool Calculation Logic
Both `nhl_team_pool._logic.js` and `nhl_api_teams_pool.js` now use the normalization function to match player teams with NHL standings.

**What changed:**
- Team names from your "Teams by Player" sheet are automatically normalized
- The system logs successful matches showing: `Original Name => Normalized Name (Points)`
- Unmatched teams are clearly reported with both original and attempted normalized names

## Using the System

### In Your "Teams by Player" Sheet
You can now use **any** of these formats for teams, and they'll all work:

| Format Type | Examples |
|------------|----------|
| Abbreviations | TOR, MTL, VGK, BOS |
| Full Names | Toronto Maple Leafs, Montreal Canadiens |
| Nicknames | Leafs, Habs, Bruins, Bolts |
| Mixed | You can use different formats in the same sheet! |

### Example "Teams by Player" Sheet

| Player | Team 1 | Team 2 | Team 3 | Team 4 |
|--------|--------|--------|--------|--------|
| Alice  | TOR    | Montreal Canadiens | VGK | Bruins |
| Bob    | Leafs  | MTL    | Vegas Golden Knights | BOS |
| Carol  | Toronto Maple Leafs | Habs | Knights | Boston Bruins |

All three players above have the same teams, just written differently - and the system will correctly match them all!

## Reference Files

### player_teams.csv
Located in `/data/player_teams.csv`, this CSV file contains:
- Official team abbreviations
- Official NHL API team names
- Common variations and nicknames

Use this file as a reference when entering team names in your sheet.

## Testing

To test the normalization system, you can run `testTeamNameNormalization()` in Apps Script:

1. Open your Apps Script project
2. Run the function `testTeamNameNormalization()`
3. Check the logs to see how different team name formats are normalized

## Troubleshooting

### Team Not Matching?
If you see a warning like:
```
WARNING: Team 'XYZ' for player 'John' not found in NHL standings (normalized: 'null')
```

**Solutions:**
1. Check the spelling of the team name
2. Refer to `player_teams.csv` for valid team names and variations
3. If it's a valid team that should be supported, the team name mapper may need to be updated

### Adding New Team Name Variations
If you have a team name format that should work but doesn't:

1. Open `team_name_mapper.js`
2. Add your variation to the `TEAM_ALIASES` object
3. Map it to the appropriate team abbreviation
4. Save and push your changes

Example:
```javascript
"Maple Leaves": "TOR",  // Common misspelling
"T.O": "TOR",           // Alternative abbreviation
```

## Files Modified

- **NEW**: `apps-script/src/team_name_mapper.js` - Team normalization logic
- **UPDATED**: `apps-script/src/nhl_team_pool._logic.js` - Uses normalization
- **UPDATED**: `apps-script/src/nhl_api_teams_pool.js` - Uses normalization
- **NEW**: `data/player_teams.csv` - Team reference guide
- **NEW**: `docs/team_name_matching.md` - This documentation

## Benefits

✅ **Flexible Input**: Use abbreviations, full names, or nicknames
✅ **Error Prevention**: Automatic normalization reduces data entry errors
✅ **Better Logging**: Clear messages showing what matched and what didn't
✅ **Easy Maintenance**: Add new variations without changing core logic
✅ **Accent Handling**: Handles special characters (e.g., Montréal vs Montreal)
