/**
 * NHL Hockey Pool - Pool Calculation Logic
 *
 * Functions for calculating pool standings based on drafted teams and NHL standings.
 *
 * @requires team_name_mapper.js - Provides normalizeTeamName() function
 */

/**
 * Calculate pool standings by merging player teams with NHL standings
 *
 * @param {Spreadsheet} sheet - The spreadsheet object
 * @param {Object} teamPointsMap - Map of team names to their current points
 * @param {Array<Array>} csvData - Player-team mapping from CSV file
 */
function calculatePoolStandings(sheet, teamPointsMap, csvData) {
  try {
    Logger.log("Starting pool standings calculation...");

    // Use CSV data instead of sheet
    // Structure: Column A = Team, Column B = Player (vertical format)
    var teamsByPlayerData = csvData;

    Logger.log("Player Matrix:" + teamsByPlayerData);

    var poolStandings = [];
    var unmatchedTeams = []; // Track teams that don't match API data
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

      // Look up team points using normalized name
      if (normalizedTeamName && teamPointsMap[normalizedTeamName] !== undefined) {
        playerTeamsMap[playerName].push({
          name: normalizedTeamName,
          originalName: teamName,  // Keep original for reference
          points: teamPointsMap[normalizedTeamName]
        });
        Logger.log("Matched: '" + teamName + "' => '" + normalizedTeamName + "' (" + teamPointsMap[normalizedTeamName] + " pts) for player " + playerName);
      } else {
        // Track unmatched teams for error reporting
        unmatchedTeams.push({
          player: playerName,
          team: teamName,
          normalized: normalizedTeamName
        });
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

      // Create output row
      // Format: Player Name | Top 3 Total | Team 1 | Team 2 | Team 3 | ...
      var outputRow = [
        playerName,
        top3Total
      ];

      // Add all teams with their points in separate columns
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
    
    // Get or create Pool Standings sheet
    var poolStandingsSheet = sheet.getSheetByName("Pool Standings");
    
    if (!poolStandingsSheet) {
      poolStandingsSheet = sheet.insertSheet("Pool Standings");
      Logger.log("Created new 'Pool Standings' sheet");
    }
    
    // Clear existing content
    poolStandingsSheet.clear();
    Logger.log(poolStandings);
    // Write the standings
    if (poolStandings.length > 1) { // More than just headers
      poolStandingsSheet.getRange(1, 1, poolStandings.length, poolStandings[0].length).setValues(poolStandings);
      
      // Format the sheet
      formatPoolStandingsSheet(poolStandingsSheet, poolStandings.length);
      
      Logger.log("Pool standings updated successfully with " + (poolStandings.length - 1) + " players");
    } else {
      poolStandingsSheet.getRange(1, 1).setValue("No player data found");
      Logger.log("WARNING: No player data found to calculate standings");
    }
    
    // Report unmatched teams if any
    if (unmatchedTeams.length > 0) {
      Logger.log("WARNING: " + unmatchedTeams.length + " unmatched teams found:");
      unmatchedTeams.forEach(function(item) {
        Logger.log("  - Player: " + item.player + ", Team: " + item.team);
      });
    }
    
  } catch (error) {
    Logger.log("ERROR in calculatePoolStandings: " + error.toString());
    throw error;
  }
}

/**
 * Format the Pool Standings sheet for better readability
 *
 * @param {Sheet} sheet - The Pool Standings sheet
 * @param {number} numRows - Number of rows with data
 */
function formatPoolStandingsSheet(sheet, numRows) {
  var numCols = sheet.getLastColumn();

  // Set font size for entire sheet to 12pt
  var allDataRange = sheet.getRange(1, 1, numRows, numCols);
  allDataRange.setFontSize(12);

  // Format header row
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4285F4");
  headerRange.setFontColor("#FFFFFF");

  // Format Top 3 Total column as numbers
  if (numRows > 1) {
    var totalRange = sheet.getRange(2, 2, numRows - 1, 1);
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
        var top3Range = sheet.getRange(row, 3, 1, top3Count);
        top3Range.setBackground("#d9ead3"); // Light green
      }
    }
  }

  // Auto-resize all columns
  sheet.autoResizeColumns(1, numCols);

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log("Pool Standings sheet formatted successfully");
}

/**
 * Get list of all NHL teams from current standings
 * Useful for validating Teams by Player sheet
 * 
 * @returns {Array} Array of team names
 */
function getAllNHLTeams() {
  try {
    var response = UrlFetchApp.fetch("https://api-web.nhle.com/v1/standings/now");
    var data = JSON.parse(response.getContentText());
    
    var teams = [];
    data.standings.forEach(function(record) {
      teams.push(record.teamName.default);
    });
    
    teams.sort();
    
    Logger.log("NHL Teams (" + teams.length + "):");
    Logger.log(teams.join(", "));
    
    return teams;
    
  } catch (error) {
    Logger.log("ERROR getting NHL teams: " + error.toString());
    return [];
  }
}

/**
 * Validate Teams by Player sheet against current NHL teams
 * Logs any team names that don't match
 */
function validatePlayerTeams() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var teamsByPlayerSheet = sheet.getSheetByName("Teams by Player");
    
    if (!teamsByPlayerSheet) {
      Logger.log("ERROR: 'Teams by Player' sheet not found");
      return;
    }
    
    // Get valid NHL teams
    var validTeams = getAllNHLTeams();
    var validTeamsSet = {};
    validTeams.forEach(function(team) {
      validTeamsSet[team] = true;
    });
    
    // Check player teams
    var data = teamsByPlayerSheet.getDataRange().getValues();
    var invalidTeams = [];
    
    for (var i = 1; i < data.length; i++) {
      var playerName = data[i][0];
      if (!playerName) continue;
      
      for (var j = 1; j < data[i].length; j++) {
        var teamName = data[i][j];
        if (teamName && !validTeamsSet[teamName]) {
          invalidTeams.push({
            player: playerName,
            team: teamName,
            row: i + 1,
            col: j + 1
          });
        }
      }
    }
    
    if (invalidTeams.length === 0) {
      Logger.log("SUCCESS: All team names are valid!");
    } else {
      Logger.log("VALIDATION ERRORS: Found " + invalidTeams.length + " invalid team names:");
      invalidTeams.forEach(function(item) {
        Logger.log("  - Row " + item.row + ", Col " + item.col + ": Player '" + item.player + "' has invalid team '" + item.team + "'");
      });
    }
    
  } catch (error) {
    Logger.log("ERROR in validatePlayerTeams: " + error.toString());
  }
}