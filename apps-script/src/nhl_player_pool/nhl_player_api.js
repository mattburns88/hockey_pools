/**
 * NHL Player API Functions
 *
 * Functions for fetching player statistics from the NHL API
 *
 * @requires player_name_mapper.js - Provides normalizePlayerName() function
 */

/**
 * Fetch top goal scorers from NHL API
 *
 * @param {number} limit - Number of top scorers to fetch (default 100)
 * @returns {Object} Map of player names to goal counts
 */
function fetchPlayerGoals(limit) {
  limit = limit || 600;

  try {
    Logger.log("Fetching top " + limit + " goal scorers from NHL API...");

    var url = "https://api-web.nhle.com/v1/skater-stats-leaders/current?categories=goals&limit=" + limit;
    var response = UrlFetchApp.fetch(url);
    var json = response.getContentText();
    var data = JSON.parse(json);

    var playerGoalsMap = {};

    if (data.goals && Array.isArray(data.goals)) {
      data.goals.forEach(function(player) {
        // Construct full player name
        var firstName = player.firstName.default || player.firstName;
        var lastName = player.lastName.default || player.lastName;
        var fullName = firstName + " " + lastName;

        var goals = player.value || 0;

        playerGoalsMap[fullName] = goals;

        Logger.log("Player: " + fullName + " - Goals: " + goals);
      });

      Logger.log("Fetched " + Object.keys(playerGoalsMap).length + " players");
    } else {
      Logger.log("WARNING: Unexpected API response structure");
    }

    return playerGoalsMap;

  } catch (error) {
    Logger.log("ERROR fetching player goals: " + error.toString());
    throw error;
  }
}

/**
 * Get goals for a specific list of players
 *
 * @param {Array<string>} playerNames - Array of player names to look up
 * @returns {Object} Map of player names to goal counts
 */
function getGoalsForPlayers(playerNames) {
  // Fetch top 150 scorers (should cover most fantasy pool players)
  var allPlayerGoals = fetchPlayerGoals(600);

  var playerGoalsMap = {};
  var notFound = [];

  playerNames.forEach(function(playerName) {
    var normalized = normalizePlayerName(playerName);

    if (normalized && allPlayerGoals[normalized] !== undefined) {
      playerGoalsMap[normalized] = allPlayerGoals[normalized];
      Logger.log("Found: " + playerName + " => " + normalized + " (" + allPlayerGoals[normalized] + " goals)");
    } else {
      notFound.push(playerName);
      Logger.log("WARNING: Player '" + playerName + "' (normalized: '" + normalized + "') not found in top 600 scorers");
      // Default to 0 goals if not in top scorers
      if (normalized) {
        playerGoalsMap[normalized] = 0;
      }
    }
  });

  if (notFound.length > 0) {
    Logger.log("Players not found in top 150: " + notFound.join(", "));
  }

  return playerGoalsMap;
}

/**
 * Test function to fetch and display current goal leaders
 */
function testFetchPlayerGoals() {
  Logger.log("=== Testing Player Goals API ===");
  var playerGoals = fetchPlayerGoals(10);

  Logger.log("\nTop 10 Goal Scorers:");
  for (var player in playerGoals) {
    Logger.log(player + ": " + playerGoals[player] + " goals");
  }
}
