/**
 * @requires team_name_mapper.js - Provides normalizeTeamName() function
 * @requires csv_parser.js - Provides parseCSVFromGitHub() function
 */

/**
 * Main function to update team pool standings
 *
 * @param {string} githubPath - Optional GitHub path to CSV file (default: "data/player_teams.csv")
 */
function updateTeamPoolStandings(githubPath) {

  // Handle event object from triggers/menus - ignore if it's an object
  if (typeof githubPath === 'object') {
    githubPath = null;
  }

  // Default GitHub path to CSV file
  githubPath = githubPath || "data/player_teams.csv";

  var response = UrlFetchApp.fetch("https://api-web.nhle.com/v1/standings/now");

  // Parse the JSON reply
  var json = response.getContentText();
  var data = JSON.parse(json);

  Logger.log(data);

  var sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1BsWA-8507bOYGFQjHci_uru2TpU6pcaZdgjnBgdfFyQ/edit");
  var targetSheet = sheet.getSheetByName("team_api_standings");

  // Create the sheet if it doesn't exist
  if (!targetSheet) {
    targetSheet = sheet.insertSheet("team_api_standings");
  }

  var output = [];

  // Create a map of team names to points for easy lookup
  var teamPointsMap = {};

  data.standings.forEach(function(record, i) {
    Logger.log(record);
    var conferenceName = record.conferenceName;
    var divisionName = record.divisionName;
    var teamName = record.teamName.default;
    var teamPoints = record.points;

    output.push([conferenceName, divisionName, teamName, teamPoints]);

    // Store team points in map for lookup
    teamPointsMap[teamName] = teamPoints;
  });

  Logger.log(output);
  targetSheet.getRange(1, 1, output.length, output[0].length).setValues(output);

  // Read player-team mappings directly from GitHub
  Logger.log("Reading player-team mappings from GitHub: " + githubPath);
  var csvData = parseCSVFromGitHub(githubPath);

  if (!csvData || csvData.length === 0) {
    throw new Error("CSV file is empty or could not be parsed");
  }

  Logger.log("Loaded " + csvData.length + " rows from CSV");

  // Now process the pool standings with CSV data
  calculatePoolStandings(sheet, teamPointsMap, csvData);
}

function calculatePoolStandings(sheet, teamPointsMap, csvData) {

  // Use CSV data instead of sheet
  // Structure: Column A = Team, Column B = Player (vertical format)
  var teamsByPlayerData = csvData;

  var poolStandings = [];
  var playerTeamsMap = {}; // Map to group teams by player

  // Skip header row (index 0) if it exists
  var startRow = 1;
  if (teamsByPlayerData.length > 0) {
    var firstRow = teamsByPlayerData[0];
    // Check if first row looks like headers
    if (firstRow[0] && (firstRow[0].toString().toLowerCase() === "team" ||
                        firstRow[0].toString().toLowerCase() === "team name")) {
      startRow = 1;
    } else {
      startRow = 0; // No header row
    }
  }

  Logger.log("Processing " + (teamsByPlayerData.length - startRow) + " team entries");

  // Parse vertical data structure: each row is one team assignment
  for (var i = startRow; i < teamsByPlayerData.length; i++) {
    var row = teamsByPlayerData[i];

    // Expected columns: Team (col 0), Points (col 1, optional), Player (col 2 or 1)
    var teamName = row[0];
    var playerName;

    // Determine which column has the player name
    // If column 1 looks like a number, then column 2 is player name
    // Otherwise, column 1 is player name
    if (row.length >= 3 && !isNaN(row[1])) {
      playerName = row[2]; // Column C (index 2)
    } else if (row.length >= 2) {
      playerName = row[1]; // Column B (index 1)
    } else {
      continue; // Skip invalid rows
    }

    // Skip empty rows
    if (!teamName || teamName.toString().trim() === "" ||
        !playerName || playerName.toString().trim() === "") {
      continue;
    }

    teamName = teamName.toString().trim();
    playerName = playerName.toString().trim();

    // Initialize player's team array if not exists
    if (!playerTeamsMap[playerName]) {
      playerTeamsMap[playerName] = [];
    }

    // Normalize the team name to match NHL API format
    var normalizedTeamName = normalizeTeamName(teamName);

    if (normalizedTeamName && teamPointsMap[normalizedTeamName] !== undefined) {
      playerTeamsMap[playerName].push({
        name: normalizedTeamName,
        originalName: teamName,  // Keep original for reference
        points: teamPointsMap[normalizedTeamName]
      });
      Logger.log("Matched: '" + teamName + "' => '" + normalizedTeamName + "' (" + teamPointsMap[normalizedTeamName] + " pts) for player " + playerName);
    } else {
      Logger.log("WARNING: Team '" + teamName + "' for player '" + playerName + "' not found in NHL standings (normalized: '" + normalizedTeamName + "')");
    }
  }

  Logger.log("Found " + Object.keys(playerTeamsMap).length + " unique players");

  // Now process each player's teams
  for (var playerName in playerTeamsMap) {
    var playerTeams = playerTeamsMap[playerName];
    
    // Sort teams by points (descending)
    playerTeams.sort(function(a, b) {
      return b.points - a.points;
    });
    
    // Calculate total of top 3 teams
    var top3Total = 0;
    for (var k = 0; k < Math.min(3, playerTeams.length); k++) {
      top3Total += playerTeams[k].points;
    }

    // Create output row: Player Name, Top 3 Total, All Teams with points
    var outputRow = [playerName, top3Total];

    // Add all teams with their points
    playerTeams.forEach(function(team) {
      outputRow.push(team.name + ": " + team.points);
    });

    poolStandings.push(outputRow);
  }
  
  // Sort pool standings by top 3 total (descending)
  poolStandings.sort(function(a, b) {
    return b[1] - a[1]; // Sort by column index 1 (Top 3 Total)
  });

  // Determine the maximum number of teams any player has for header columns
  var maxTeams = 0;
  poolStandings.forEach(function(row) {
    // Row format: [Player, Top3Total, Team1:Points, Team2:Points, ...]
    // Teams start at index 2
    var numTeams = row.length - 2;
    if (numTeams > maxTeams) {
      maxTeams = numTeams;
    }
  });

  // Pad all rows to have the same number of columns
  poolStandings.forEach(function(row) {
    var currentTeams = row.length - 2;
    var neededPadding = maxTeams - currentTeams;
    for (var i = 0; i < neededPadding; i++) {
      row.push(""); // Add empty cells to match max columns
    }
  });

  // Build dynamic headers
  var headers = ["Player", "Top 3 Total"];
  for (var i = 1; i <= maxTeams; i++) {
    headers.push("Team " + i);
  }
  poolStandings.unshift(headers);
  
  // Write to team_pool_standings sheet
  var poolStandingsSheet = sheet.getSheetByName("Team Pool Standings");

  // Create the sheet if it doesn't exist
  if (!poolStandingsSheet) {
    poolStandingsSheet = sheet.insertSheet("Team Pool Standings");
  }
  
  // Clear existing content
  poolStandingsSheet.clear();
  
  // Write the standings
  poolStandingsSheet.getRange(1, 1, poolStandings.length, poolStandings[0].length).setValues(poolStandings);

  // Format the sheet
  var numRows = poolStandings.length;
  var numCols = poolStandings[0].length;

  // Set font size for entire sheet to 12pt
  var allDataRange = poolStandingsSheet.getRange(1, 1, numRows, numCols);
  allDataRange.setFontSize(12);

  // Format header row
  var headerRange = poolStandingsSheet.getRange(1, 1, 1, numCols);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4285F4");
  headerRange.setFontColor("#FFFFFF");

  // Format Top 3 Total column as numbers
  if (numRows > 1) {
    var totalRange = poolStandingsSheet.getRange(2, 2, numRows - 1, 1);
    totalRange.setNumberFormat("#,##0");
    totalRange.setHorizontalAlignment("right");
  }

  // Highlight top 3 teams for each player with light green
  // Team columns start at column 3 (column C)
  if (numRows > 1 && numCols > 2) {
    for (var row = 2; row <= numRows; row++) {
      // Highlight the first 3 team columns (columns 3, 4, 5) with light green
      var top3Count = Math.min(3, numCols - 2); // Don't exceed available columns
      if (top3Count > 0) {
        var top3Range = poolStandingsSheet.getRange(row, 3, 1, top3Count);
        top3Range.setBackground("#d9ead3"); // Light green
      }
    }
  }

  // Auto-resize all columns
  poolStandingsSheet.autoResizeColumns(1, numCols);

  // Freeze header row
  poolStandingsSheet.setFrozenRows(1);

  Logger.log("Team Pool Standings updated successfully!");
}