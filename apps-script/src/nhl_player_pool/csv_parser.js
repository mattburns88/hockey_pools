/**
 * CSV Parser for Player-Skater Data
 *
 * Functions to parse CSV data from Google Drive
 */

/**
 * Parse CSV file from Google Drive
 *
 * @param {string} fileName - Name of the CSV file (e.g., "player_skaters.csv")
 * @param {string} folderId - Optional Google Drive folder ID. If not provided, searches root.
 * @returns {Array<Array<string>>} 2D array of CSV data
 */
function parseCSVFromDrive(fileName, folderId) {
  try {
    Logger.log("Searching for CSV file: " + fileName);

    var files;
    if (folderId) {
      var folder = DriveApp.getFolderById(folderId);
      files = folder.getFilesByName(fileName);
    } else {
      files = DriveApp.getFilesByName(fileName);
    }

    if (!files.hasNext()) {
      throw new Error("CSV file '" + fileName + "' not found in Google Drive");
    }

    var file = files.next();
    Logger.log("Found file: " + file.getName() + " (ID: " + file.getId() + ")");

    var csvContent = file.getBlob().getDataAsString();
    var csvData = parseCSVContent(csvContent);

    Logger.log("Parsed " + csvData.length + " rows from CSV");
    return csvData;

  } catch (error) {
    Logger.log("ERROR parsing CSV from Drive: " + error.toString());
    throw error;
  }
}

/**
 * Parse CSV content string into 2D array
 *
 * @param {string} csvContent - Raw CSV content
 * @returns {Array<Array<string>>} 2D array of CSV data
 */
function parseCSVContent(csvContent) {
  var lines = csvContent.split(/\r?\n/);
  var result = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    // Skip empty lines
    if (line === "") {
      continue;
    }

    // Simple CSV parsing (handles basic cases)
    var cells = line.split(',');
    var row = [];

    for (var j = 0; j < cells.length; j++) {
      var cell = cells[j].trim();
      row.push(cell);
    }

    result.push(row);
  }

  return result;
}

/**
 * Parse CSV from a URL (for testing or external sources)
 *
 * @param {string} url - URL to the CSV file
 * @returns {Array<Array<string>>} 2D array of CSV data
 */
function parseCSVFromURL(url) {
  try {
    Logger.log("Fetching CSV from URL: " + url);

    var response = UrlFetchApp.fetch(url);
    var csvContent = response.getContentText();
    var csvData = parseCSVContent(csvContent);

    Logger.log("Parsed " + csvData.length + " rows from URL");
    return csvData;

  } catch (error) {
    Logger.log("ERROR parsing CSV from URL: " + error.toString());
    throw error;
  }
}

/**
 * Test function to verify CSV parsing
 */
function testCSVParsing() {
  Logger.log("=== Testing CSV Parsing ===");

  try {
    // Test parsing from Drive
    var csvData = parseCSVFromDrive("player_skaters.csv");

    Logger.log("\nFirst 10 rows:");
    for (var i = 0; i < Math.min(10, csvData.length); i++) {
      Logger.log("Row " + i + ": " + csvData[i].join(" | "));
    }

    Logger.log("\nTotal rows: " + csvData.length);
    Logger.log("Test completed successfully!");

  } catch (error) {
    Logger.log("Test failed: " + error.toString());
  }
}
