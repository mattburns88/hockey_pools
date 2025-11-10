# NHL Hockey Pool Rules

## Overview

A season-long hockey pool where participants draft NHL teams and compete based on team performance.

## Draft

### Draft Process
- Each player drafts multiple NHL teams before the season starts
- Teams can be drafted by multiple players (not exclusive)
- Number of teams per player: (To be determined by pool organizer)

### Draft Order
- (To be determined by pool organizer)
- Common methods: Random draw, snake draft, auction

## Scoring System

### Team Points
Teams earn points based on NHL standings:
- **Win (Regulation):** 2 points
- **Win (Overtime/Shootout):** 2 points  
- **Loss (Overtime/Shootout):** 1 point
- **Loss (Regulation):** 0 points

*Note: These are standard NHL points, fetched directly from the API*

### Player Pool Score Calculation

**Each player's pool score = Sum of their top 3 teams' points**

Example:
```
Player: John Smith
Teams drafted:
  1. Toronto Maple Leafs: 98 points
  2. Edmonton Oilers: 95 points
  3. Vegas Golden Knights: 92 points
  4. Buffalo Sabres: 75 points
  5. Chicago Blackhawks: 52 points

Top 3 Total: 98 + 95 + 92 = 285 points
Pool Ranking: Based on this 285 total
```

### Why Top 3?
- Rewards strategic drafting
- Reduces impact of one bad pick
- Keeps competition close throughout season
- Maintains engagement even if some teams underperform

## Rankings

Players are ranked in descending order by their top 3 total:
1. Highest total = 1st place
2. Second highest = 2nd place
3. And so on...

### Tiebreakers
If two players have identical top 3 totals:
1. Sum of all teams (4th place team and beyond)
2. If still tied: Highest single team points
3. If still tied: Shared ranking

## Season Timeline

### Pre-Season
- Draft occurs before NHL season starts
- Teams are recorded in "Teams by Player" sheet

### During Season  
- Standings update automatically via NHL API
- Pool rankings recalculate based on current standings
- Recommended update frequency: Daily

### End of Season
- Final rankings determined after NHL regular season ends (82 games per team)
- Playoffs do NOT count toward pool standings

## Prizes

(To be determined by pool organizer)

Common prize structures:
- Winner takes all
- Top 3 places split prize pool (50% / 30% / 20%)
- Weekly/monthly mini-prizes for leading at checkpoints

## Rule Modifications

Pool organizer can modify:
- Number of teams each player drafts
- Whether to count top 3, top 5, or all teams
- Include/exclude playoff performance
- Draft method and order
- Prize structure

**Important:** Any rule changes must be communicated and agreed upon before the draft.

## Fair Play

- No trading teams after draft
- No adding/dropping teams during season
- Standings are official and final based on NHL data
- Disputes resolved by pool organizer

## Strategy Tips

### Drafting Strategy
- **Balanced approach:** Mix of favorites and dark horses
- **Division awareness:** Teams in weak divisions may accumulate more points
- **Schedule considerations:** Teams with favorable schedules
- **Consistency matters:** Aim for 3 solid teams rather than 1 great and 2 terrible

### Common Mistakes
- Drafting too many teams from same division
- Ignoring goaltending/injuries pre-season
- Overvaluing past season performance
- Not considering trades/roster changes

### Advanced Strategy
- Look at strength of schedule
- Consider teams that improved in off-season
- Balance between established teams and potential breakouts
- Hedge bets across conferences

## Technical Details

### Data Source
- NHL Official API: `https://api-web.nhle.com/v1/standings/now`
- Updates in real-time during games
- Historical accuracy guaranteed by official NHL data

### Automation
- Automated updates via Google Apps Script
- Manual refresh option available
- Error handling for API failures

## Questions?

Contact pool organizer for:
- Draft scheduling
- Rule clarifications  
- Technical issues
- Payout information