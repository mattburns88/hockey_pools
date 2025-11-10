# NHL API Documentation

## Overview

The NHL provides a public API for accessing team standings, game data, player stats, and more.

**Base URL:** `https://api-web.nhle.com`

## Current Endpoints Used

### 1. Current Standings

**Endpoint:** `/v1/standings/now`

**Method:** GET

**Description:** Returns current NHL standings for all teams.

**Response Structure:**
```json
{
  "standings": [
    {
      "conferenceAbbrev": "E",
      "conferenceName": "Eastern",
      "divisionAbbrev": "A",
      "divisionName": "Atlantic",
      "teamName": {
        "default": "Florida Panthers",
        "fr": "Panthers de la Floride"
      },
      "teamCommonName": {
        "default": "Panthers"
      },
      "teamAbbrev": {
        "default": "FLA"
      },
      "placeName": {
        "default": "Florida"
      },
      "points": 95,
      "gamesPlayed": 82,
      "wins": 42,
      "losses": 30,
      "otLosses": 10,
      "goalFor": 245,
      "goalAgainst": 230,
      "goalDifferential": 15,
      "homeWins": 24,
      "homeRegulationWins": 20,
      "roadWins": 18,
      "regulationWins": 35,
      "regulationPlusOtWins": 40,
      "streakCode": "W",
      "streakCount": 3,
      "waiversSequence": 1,
      "wildcardSequence": 0,
      "leagueSequence": 15
    }
  ]
}
```

**Key Fields:**
- `conferenceName` - Conference (Eastern/Western)
- `divisionName` - Division name
- `teamName.default` - Official team name (use for matching)
- `points` - Total points (2 for win, 1 for OT loss)
- `gamesPlayed` - Games played
- `wins/losses/otLosses` - Game results
- `goalDifferential` - Goal differential (+/-)
- `streakCode` & `streakCount` - Current win/loss streak

## Potential Additional Endpoints

### 2. Historical Standings (Future Use)

**Endpoint:** `/v1/standings/{date}`

**Example:** `/v1/standings/2024-01-15`

**Description:** Get standings as of a specific date.

### 3. Team Schedule

**Endpoint:** `/v1/club-schedule/{teamAbbrev}/week/now`

**Example:** `/v1/club-schedule/TOR/week/now`

**Description:** Get upcoming games for a team.

### 4. Season Information

**Endpoint:** `/v1/season`

**Description:** Get current season details.

### 5. Player Stats

**Endpoint:** `/v1/player/{playerId}/landing`

**Description:** Get detailed player information and stats.

## Rate Limiting

- No official rate limits documented
- Recommend caching results
- Update frequency: Once per day is sufficient for standings

## Error Handling

Common HTTP status codes:
- `200` - Success
- `404` - Endpoint not found
- `500` - Server error

**Recommendation:** Implement retry logic with exponential backoff for production use.

## Data Freshness

- Standings update in real-time during games
- Typically finalized within minutes after game completion
- Best practice: Run updates once daily (e.g., midnight EST)

## Team Abbreviations

| Team | Abbreviation | Full Name |
|------|--------------|-----------|
| ANA | ANA | Anaheim Ducks |
| BOS | BOS | Boston Bruins |
| BUF | BUF | Buffalo Sabres |
| CGY | CGY | Calgary Flames |
| CAR | CAR | Carolina Hurricanes |
| CHI | CHI | Chicago Blackhawks |
| COL | COL | Colorado Avalanche |
| CBJ | CBJ | Columbus Blue Jackets |
| DAL | DAL | Dallas Stars |
| DET | DET | Detroit Red Wings |
| EDM | EDM | Edmonton Oilers |
| FLA | FLA | Florida Panthers |
| LAK | LAK | Los Angeles Kings |
| MIN | MIN | Minnesota Wild |
| MTL | MTL | Montréal Canadiens |
| NSH | NSH | Nashville Predators |
| NJD | NJD | New Jersey Devils |
| NYI | NYI | New York Islanders |
| NYR | NYR | New York Rangers |
| OTT | OTT | Ottawa Senators |
| PHI | PHI | Philadelphia Flyers |
| PIT | PIT | Pittsburgh Penguins |
| SJS | SJS | San Jose Sharks |
| SEA | SEA | Seattle Kraken |
| STL | STL | St. Louis Blues |
| TBL | TBL | Tampa Bay Lightning |
| TOR | TOR | Toronto Maple Leafs |
| VAN | VAN | Vancouver Canucks |
| VGK | VGK | Vegas Golden Knights |
| WSH | WSH | Washington Capitals |
| WPG | WPG | Winnipeg Jets |
| UTA | UTA | Utah Hockey Club |

## References

- Official NHL website: https://www.nhl.com
- API discovered through network inspection
- No official API documentation available

## Notes for Databricks Migration

When moving to Databricks:
- Use Python `requests` library
- Implement proper error handling
- Cache responses to avoid repeated calls
- Consider storing historical snapshots
- Use Databricks Jobs for scheduled updates