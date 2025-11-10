/**
 * NHL Player Pool - Pool Calculation Logic
 *
 * Functions for calculating player pool standings based on drafted skaters and their goals.
 *
 * @requires player_name_mapper.js - Provides normalizePlayerName() function
 * @requires nhl_player_api.js - Provides getGoalsForPlayers() function
 */

/**
 * Calculate player pool standings from CSV data
 *
 * @param {Spreadsheet} sheet - The spreadsheet object
 * @param {Object} playerGoalsMap - Map of player names to their goal counts
 * @param {Array<Array>} csvData - Player-skater mapping from CSV file
 */
function calculatePlayerPoolStandings(sheet, playerGoalsMap, csvData) {
  try {
    Logger.log("Starting player pool standings calculation...");

    // Use CSV data instead of sheet
    // Structure: Column A = Player, Column B = Skater (vertical format)
    var skatersByPlayerData = csvData;

    Logger.log("Skaters by Player Matrix: " + skatersByPlayerData);

    var poolStandings = [];
    var unmatchedPlayers = []; // Track skaters that don't match API data
    var playerSkatersMap = {}; // Map to group skaters by player

    // Skip header row (index 0) if it exists
    var startRow = 1;
    if (skatersByPlayerData.length > 0) {
      var firstRow = skatersByPlayerData[0];
      // Check if first row looks like headers
      if (firstRow[0] && (firstRow[0].toString().toLowerCase() === "player" ||
                          firstRow[0].toString().toLowerCase().includes("player"))) {
        startRow = 1;
      } else {
        startRow = 0; // No header row
      }
    }

    Logger.log("Processing " + (skatersByPlayerData.length - startRow) + " skater entries");

    // Parse vertical data structure: each row is one player-skater assignment
    for (var i = startRow; i < skatersByPlayerData.length; i++) {
      var row = skatersByPlayerData[i];

      // Expected columns: Player (col 0), Skater (col 1)
      var playerName = row[0];
      var skaterName = row[1];

      // Skip empty rows
      if (!playerName || playerName.toString().trim() === "" ||
          !skaterName || skaterName.toString().trim() === "") {
        continue;
      }

      playerName = playerName.toString().trim();
      skaterName = skaterName.toString().trim();

      // Initialize player's skater array if not exists
      if (!playerSkatersMap[playerName]) {
        playerSkatersMap[playerName] = [];
      }

      // Normalize the skater name to match NHL API format
      var normalizedSkaterName = normalizePlayerName(skaterName);

      // Look up skater goals using normalized name
      if (normalizedSkaterName && playerGoalsMap[normalizedSkaterName] !== undefined) {
        playerSkatersMap[playerName].push({
          name: normalizedSkaterName,
          originalName: skaterName,  // Keep original for reference
          goals: playerGoalsMap[normalizedSkaterName]
        });
        Logger.log("Matched: '" + skaterName + "' => '" + normalizedSkaterName + "' (" + playerGoalsMap[normalizedSkaterName] + " goals) for player " + playerName);
      } else {
        // Track unmatched skaters for error reporting
        unmatchedPlayers.push({
          player: playerName,
          skater: skaterName,
          normalized: normalizedSkaterName
        });
        Logger.log("WARNING: Skater '" + skaterName + "' for player '" + playerName + "' not found in NHL data (normalized: '" + normalizedSkaterName + "')");
      }
    }

    Logger.log("Found " + Object.keys(playerSkatersMap).length + " unique players");

    // Now process each player's skaters
    for (var playerName in playerSkatersMap) {
      var playerSkaters = playerSkatersMap[playerName];

      // Sort skaters by goals (descending)
      playerSkaters.sort(function(a, b) {
        return b.goals - a.goals;
      });

      // Calculate total of top 4 skaters
      var top4Total = 0;

      for (var k = 0; k < Math.min(4, playerSkaters.length); k++) {
        top4Total += playerSkaters[k].goals;
      }

      // Create output row
      // Format: Player Name | Top 4 Total | Skater 1 | Skater 2 | Skater 3 | ...
      var outputRow = [
        playerName,
        top4Total
      ];

      // Add all skaters with their goals in separate columns
      playerSkaters.forEach(function(skater) {
        outputRow.push(skater.name + ": " + skater.goals);
      });

      poolStandings.push(outputRow);
    }

    // Sort pool standings by top 4 total (descending)
    poolStandings.sort(function(a, b) {
      return b[1] - a[1]; // Sort by column index 1 (Top 4 Total)
    });

    // Determine the maximum number of skaters any player has for header columns
    var maxSkaters = 0;
    poolStandings.forEach(function(row) {
      // Row format: [Player, Top4Total, Skater1:Goals, Skater2:Goals, ...]
      // Skaters start at index 2
      var numSkaters = row.length - 2;
      if (numSkaters > maxSkaters) {
        maxSkaters = numSkaters;
      }
    });

    // Pad all rows to have the same number of columns
    poolStandings.forEach(function(row) {
      var currentSkaters = row.length - 2;
      var neededPadding = maxSkaters - currentSkaters;
      for (var i = 0; i < neededPadding; i++) {
        row.push(""); // Add empty cells to match max columns
      }
    });

    // Build dynamic headers
    var headers = ["Player", "Top 4 Total"];
    for (var i = 1; i <= maxSkaters; i++) {
      headers.push("Skater " + i);
    }
    poolStandings.unshift(headers);

    // Get or create Player Pool Standings sheet
    var poolStandingsSheet = sheet.getSheetByName("Player Pool Standings");

    if (!poolStandingsSheet) {
      poolStandingsSheet = sheet.insertSheet("Player Pool Standings");
      Logger.log("Created new 'Player Pool Standings' sheet");
    }

    // Clear existing content
    poolStandingsSheet.clear();

    // Write the standings
    if (poolStandings.length > 1) { // More than just headers
      poolStandingsSheet.getRange(1, 1, poolStandings.length, poolStandings[0].length).setValues(poolStandings);

      // Format the sheet
      formatPlayerPoolStandingsSheet(poolStandingsSheet, poolStandings.length);

      Logger.log("Player Pool standings updated successfully with " + (poolStandings.length - 1) + " players");
    } else {
      poolStandingsSheet.getRange(1, 1).setValue("No player data found");
      Logger.log("WARNING: No player data found to calculate standings");
    }

    // Report unmatched skaters if any
    if (unmatchedPlayers.length > 0) {
      Logger.log("WARNING: " + unmatchedPlayers.length + " unmatched skaters found:");
      unmatchedPlayers.forEach(function(item) {
        Logger.log("  - Player: " + item.player + ", Skater: " + item.skater);
      });
    }

  } catch (error) {
    Logger.log("ERROR in calculatePlayerPoolStandings: " + error.toString());
    throw error;
  }
}

/**
 * Format the Player Pool Standings sheet for better readability
 *
 * @param {Sheet} sheet - The Player Pool Standings sheet
 * @param {number} numRows - Number of rows with data
 */
function formatPlayerPoolStandingsSheet(sheet, numRows) {
  var numCols = sheet.getLastColumn();

  // Set font size for entire sheet to 12pt
  var allDataRange = sheet.getRange(1, 1, numRows, numCols);
  allDataRange.setFontSize(12);

  // Format header row
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4285F4");
  headerRange.setFontColor("#FFFFFF");

  // Format Top 4 Total column as numbers
  if (numRows > 1) {
    var totalRange = sheet.getRange(2, 2, numRows - 1, 1);
    totalRange.setNumberFormat("#,##0");
    totalRange.setHorizontalAlignment("right");
  }

  // Highlight top 4 skaters for each player with light green
  // Skater columns start at column 3 (column C)
  if (numRows > 1 && numCols > 2) {
    for (var row = 2; row <= numRows; row++) {
      // Highlight the first 4 skater columns (columns 3, 4, 5, 6) with light green
      var top4Count = Math.min(4, numCols - 2); // Don't exceed available columns
      if (top4Count > 0) {
        var top4Range = sheet.getRange(row, 3, 1, top4Count);
        top4Range.setBackground("#d9ead3"); // Light green
      }
    }
  }

  // Auto-resize all columns
  sheet.autoResizeColumns(1, numCols);

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log("Player Pool Standings sheet formatted successfully");
}
