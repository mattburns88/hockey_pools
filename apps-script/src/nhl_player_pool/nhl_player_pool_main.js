/**
 * NHL Player Pool - Main Entry Point
 *
 * Main function to fetch player goals and calculate player pool standings
 *
 * @requires player_name_mapper.js
 * @requires nhl_player_api.js
 * @requires player_pool_logic.js
 * @requires csv_parser.js
 */

/**
 * Main function to update player pool standings
 * Fetches current player goals from NHL API and calculates pool standings
 * Reads player-skater mappings from player_skaters.csv in Google Drive
 *
 * @param {string} csvFileName - Optional CSV file name (default: "player_skaters.csv")
 * @param {string} folderId - Optional Google Drive folder ID
 */
function updatePlayerPoolStandings(csvFileName, folderId) {
  try {
    Logger.log("=== Starting Player Pool Update ===");

    // Default CSV file name
    csvFileName = csvFileName || "player_skaters.csv";

    // Get the active spreadsheet
    var sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1BsWA-8507bOYGFQjHci_uru2TpU6pcaZdgjnBgdfFyQ/edit");

    // Step 1: Parse CSV file from Google Drive
    Logger.log("Reading player-skater mappings from CSV: " + csvFileName);
    var csvData = parseCSVFromDrive(csvFileName, folderId);

    if (!csvData || csvData.length === 0) {
      throw new Error("CSV file is empty or could not be parsed");
    }

    Logger.log("Loaded " + csvData.length + " rows from CSV");

    // Collect all unique skater names from the CSV
    var allSkaters = [];
    var startRow = 1; // Skip header row

    // Check if first row is header
    if (csvData.length > 0 && csvData[0][0].toLowerCase() === "player") {
      startRow = 1;
    } else {
      startRow = 0;
    }

    for (var i = startRow; i < csvData.length; i++) {
      var row = csvData[i];
      if (row.length >= 2) {
        var skaterName = row[1]; // Column B (index 1) is the skater name
        if (skaterName && skaterName.trim() !== "") {
          allSkaters.push(skaterName.trim());
        }
      }
    }

    Logger.log("Found " + allSkaters.length + " skaters in the CSV");

    // Step 2: Fetch player goals from NHL API
    Logger.log("Fetching player goals from NHL API...");
    var playerGoalsMap = getGoalsForPlayers(allSkaters);

    Logger.log("Retrieved goal data for " + Object.keys(playerGoalsMap).length + " players");

    // Step 3: Calculate pool standings using CSV data
    calculatePlayerPoolStandings(sheet, playerGoalsMap, csvData);

    Logger.log("=== Player Pool Update Complete ===");

  } catch (error) {
    Logger.log("ERROR in updatePlayerPoolStandings: " + error.toString());
    throw error;
  }
}

/**
 * Test function to verify the player pool system
 */
function testPlayerPoolSystem() {
  Logger.log("=== Testing Player Pool System ===");

  // Test 1: Player name normalization
  testPlayerNameNormalization();

  // Test 2: Fetch sample player goals
  Logger.log("\n=== Testing Player Goals Fetch ===");
  var testPlayers = ["Draisaitl", "McDavid", "Matthews", "Ovechkin"];
  var goals = getGoalsForPlayers(testPlayers);

  Logger.log("\nTest Players Goals:");
  for (var player in goals) {
    Logger.log(player + ": " + goals[player] + " goals");
  }

  Logger.log("\n=== Test Complete ===");
}
