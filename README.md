# NHL Hockey Pools

A Google Apps Script project for managing NHL hockey pools, tracking both team-based and player-based fantasy leagues.

## Project Overview

This project provides automated tracking and standings calculation for two types of NHL hockey pools:

1. **Team Pool** - Participants draft NHL teams, scored by team points in standings (top 3 teams count)
2. **Player Pool** - Participants draft NHL skaters, scored by individual player goals (top 4 skaters count)

## Features

### Team Pool
- ✅ Tracks team standings via NHL API
- ✅ Supports multiple team name formats (full names, abbreviations, nicknames)
- ✅ Calculates pool standings based on top 3 teams
- ✅ Visual highlighting of top 3 teams (light green)
- ✅ Automatic team name normalization

### Player Pool
- ✅ Tracks player goal statistics via NHL API
- ✅ Supports player name aliases and variations
- ✅ Calculates pool standings based on top 4 skaters
- ✅ Visual highlighting of top 4 goal scorers (light green)
- ✅ Automatic player name normalization

## Project Structure

```
hockey_pools/
├── apps-script/
│   └── src/
│       ├── nhl_api.js                          # Basic NHL standings API
│       ├── nhl_api_teams_pool.js               # Team pool API integration
│       ├── nhl_team_pool._logic.js             # Team pool calculations
│       ├── team_name_mapper.js                 # Team name normalization
│       └── nhl_player_pool/
│           ├── player_name_mapper.js           # Player name normalization
│           ├── nhl_player_api.js               # Player stats API
│           ├── player_pool_logic.js            # Player pool calculations
│           ├── nhl_player_pool_main.js         # Player pool entry point
│           └── csv_parser.js                   # CSV file parser for Drive
├── data/
│   ├── player_teams.csv                        # Team pool reference data
│   └── player_skaters.csv                      # Player pool data (upload to Drive)
├── docs/
│   ├── team_name_matching.md                   # Team pool documentation
│   └── player_pool_system.md                   # Player pool documentation
└── README.md                                    # This file
```

## Setup

### Prerequisites
- Google Account with access to Google Sheets
- Node.js installed (for clasp)
- clasp CLI tool: `npm install -g @google/clasp`

### Installation

1. **Clone this repository:**
   ```bash
   cd /path/to/your/workspace
   git clone <repository-url>
   cd hockey_pools
   ```

2. **Login to clasp:**
   ```bash
   clasp login
   ```

3. **Create/link Google Apps Script project:**
   ```bash
   clasp create --title "NHL Hockey Pools" --type sheets
   # OR link to existing project
   clasp clone <script-id>
   ```

4. **Push code to Google Apps Script:**
   ```bash
   clasp push
   ```

5. **Set up data sources:**
   - **Team Pool**: Upload `data/player_teams.csv` to your Google Drive
   - **Player Pool**: Upload `data/player_skaters.csv` to your Google Drive
   - Populate with your pool data (see Data Structure section)

## Data Structure

### Team Pool - "player_teams.csv" (Google Drive)
**Structure:** Vertical (rows)

| Team | Player |
|------|--------|
| New York Islanders | Bo |
| Minnesota Wild | Bo |
| Vegas Golden Knights | Russ |

### Player Pool - "player_skaters.csv" (Google Drive)
**Structure:** Vertical (rows)

| Player | Skater    |
|--------|-----------|
| Bo     | Draisaitl |
| Bo     | Hagel     |
| Bo     | Kempe     |
| Bo     | Crosby    |
| Dennis | Ovechkin  |
| Dennis | Kucherov  |
| Dennis | Scheifele |

## Usage

### Update Team Pool Standings
```javascript
nhl_api_v2();  // Fetches NHL standings and updates team pool
```

### Update Player Pool Standings
```javascript
updatePlayerPoolStandings();  // Fetches player goals and updates player pool
```

### Test Functions
```javascript
// Test team name normalization
testTeamNameNormalization();

// Test player pool system
testPlayerPoolSystem();

// Validate team names
validatePlayerTeams();
```

## NHL API Endpoints Used

### Team Standings
```
https://api-web.nhle.com/v1/standings/now
```
Returns current NHL standings with team points.

### Player Goals
```
https://api-web.nhle.com/v1/skater-stats-leaders/20242025/2?categories=goals&limit=150
```
Returns top goal scorers for the current season.

## Output

Both pools generate formatted standings sheets:

### Pool Standings (Teams)
- Player rankings by top 3 team points
- Top 3 teams highlighted in light green
- 12pt font, auto-sized columns
- Frozen header row

### Player Pool Standings (Skaters)
- Player rankings by top 4 skater goals
- Top 4 skaters highlighted in light green
- 12pt font, auto-sized columns
- Frozen header row

## Name Normalization

### Team Names
Supports various formats:
- **Full names**: Toronto Maple Leafs
- **Abbreviations**: TOR, MTL, VGK
- **Nicknames**: Leafs, Habs, Bolts
- **Variations**: Montreal Canadiens (without accent)

### Player Names
Supports various formats:
- **Last name only**: Draisaitl
- **Full names**: Leon Draisaitl
- **Nicknames**: J Hughes (→ Jack Hughes)
- **With spaces**: "Marchand " (trimmed automatically)

## Documentation

Detailed documentation available in `/docs`:

- [Team Name Matching System](docs/team_name_matching.md)
- [Player Pool System](docs/player_pool_system.md)

## Adding Support for New Names

### Add Team
Edit [team_name_mapper.js](apps-script/src/team_name_mapper.js):
```javascript
"Utah": "Utah Hockey Club",
"Utah Hockey Club": "Utah Hockey Club"
```

### Add Player
Edit [player_name_mapper.js](apps-script/src/nhl_player_pool/player_name_mapper.js):
```javascript
"Bedard": "Connor Bedard",
"Connor Bedard": "Connor Bedard"
```

## Troubleshooting

### Team/Player Not Found
Add the name to the appropriate mapper file (team_name_mapper.js or player_name_mapper.js)

### API Errors
Check NHL API status and ensure you have internet connectivity from Apps Script

### CSV File Not Found
- **Team Pool**: Ensure `player_teams.csv` is uploaded to Google Drive and accessible
- **Player Pool**: Ensure `player_skaters.csv` is uploaded to Google Drive and accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Credits

- NHL API: https://api-web.nhle.com
- Built with Google Apps Script
- Managed with clasp

## Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review test functions for examples
