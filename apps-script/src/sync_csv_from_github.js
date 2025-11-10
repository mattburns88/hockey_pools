/**
 * Sync CSV files from GitHub to Google Drive
 *
 * This script downloads CSV files from your GitHub repository and
 * uploads/updates them in Google Drive automatically.
 */

/**
 * Configuration - Update these values for your repository
 */
var GITHUB_CONFIG = {
  // Your GitHub repository details
  owner: "mattb",  // Your GitHub username
  repo: "hockey_pools",
  branch: "main",

  // Files to sync
  files: [
    {
      githubPath: "data/player_teams.csv",
      driveName: "player_teams.csv",
      folderId: null  // null = root Drive, or specify folder ID
    },
    {
      githubPath: "data/player_skaters.csv",
      driveName: "player_skaters.csv",
      folderId: null
    }
  ]
};

/**
 * Main sync function - call this to update CSV files from GitHub
 */
function syncCSVFromGitHub() {
  try {
    Logger.log("=== Starting CSV Sync from GitHub ===");

    var synced = [];
    var errors = [];

    GITHUB_CONFIG.files.forEach(function(fileConfig) {
      try {
        Logger.log("\nSyncing: " + fileConfig.driveName);
        syncSingleFile(fileConfig);
        synced.push(fileConfig.driveName);
        Logger.log("✓ Successfully synced: " + fileConfig.driveName);
      } catch (error) {
        errors.push({
          file: fileConfig.driveName,
          error: error.toString()
        });
        Logger.log("✗ Error syncing " + fileConfig.driveName + ": " + error.toString());
      }
    });

    Logger.log("\n=== Sync Complete ===");
    Logger.log("Successfully synced: " + synced.length + " files");
    if (errors.length > 0) {
      Logger.log("Errors: " + errors.length);
      errors.forEach(function(err) {
        Logger.log("  - " + err.file + ": " + err.error);
      });
    }

    return {
      success: synced,
      errors: errors
    };

  } catch (error) {
    Logger.log("ERROR in syncCSVFromGitHub: " + error.toString());
    throw error;
  }
}

/**
 * Sync a single file from GitHub to Drive
 *
 * @param {Object} fileConfig - File configuration object
 */
function syncSingleFile(fileConfig) {
  // Build GitHub raw content URL
  var githubUrl = "https://raw.githubusercontent.com/" +
                  GITHUB_CONFIG.owner + "/" +
                  GITHUB_CONFIG.repo + "/" +
                  GITHUB_CONFIG.branch + "/" +
                  fileConfig.githubPath;

  Logger.log("Fetching from: " + githubUrl);

  // Fetch file from GitHub
  var response = UrlFetchApp.fetch(githubUrl);
  var content = response.getContentText();

  Logger.log("Downloaded " + content.length + " bytes");

  // Check if file already exists in Drive
  var existingFile = findFileInDrive(fileConfig.driveName, fileConfig.folderId);

  if (existingFile) {
    // Update existing file
    Logger.log("Updating existing file: " + existingFile.getName());
    existingFile.setContent(content);
  } else {
    // Create new file
    Logger.log("Creating new file: " + fileConfig.driveName);

    var blob = Utilities.newBlob(content, 'text/csv', fileConfig.driveName);

    if (fileConfig.folderId) {
      var folder = DriveApp.getFolderById(fileConfig.folderId);
      folder.createFile(blob);
    } else {
      DriveApp.createFile(blob);
    }
  }
}

/**
 * Find a file in Google Drive
 *
 * @param {string} fileName - Name of the file to find
 * @param {string} folderId - Optional folder ID to search in
 * @returns {File|null} The file object or null if not found
 */
function findFileInDrive(fileName, folderId) {
  var files;

  if (folderId) {
    var folder = DriveApp.getFolderById(folderId);
    files = folder.getFilesByName(fileName);
  } else {
    files = DriveApp.getFilesByName(fileName);
  }

  if (files.hasNext()) {
    return files.next();
  }

  return null;
}

/**
 * Test function to verify GitHub connection
 */
function testGitHubConnection() {
  Logger.log("=== Testing GitHub Connection ===");

  var testUrl = "https://raw.githubusercontent.com/" +
                GITHUB_CONFIG.owner + "/" +
                GITHUB_CONFIG.repo + "/" +
                GITHUB_CONFIG.branch + "/" +
                GITHUB_CONFIG.files[0].githubPath;

  Logger.log("Test URL: " + testUrl);

  try {
    var response = UrlFetchApp.fetch(testUrl);
    var content = response.getContentText();

    Logger.log("✓ Connection successful!");
    Logger.log("Downloaded " + content.length + " bytes");
    Logger.log("\nFirst 200 characters:");
    Logger.log(content.substring(0, 200));

    return true;
  } catch (error) {
    Logger.log("✗ Connection failed: " + error.toString());
    Logger.log("\nPlease check:");
    Logger.log("1. GitHub username is correct");
    Logger.log("2. Repository name is correct");
    Logger.log("3. Branch name is correct");
    Logger.log("4. File path is correct");
    Logger.log("5. Repository is public (or you have a token)");

    return false;
  }
}

/**
 * Set up a time-based trigger to sync daily
 * Call this once to set up automatic daily syncing
 */
function setupDailySync() {
  // Delete existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'syncCSVFromGitHub') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger for 6 AM every day
  ScriptApp.newTrigger('syncCSVFromGitHub')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();

  Logger.log("Daily sync trigger created - will run at 6 AM daily");
}

/**
 * Remove daily sync trigger
 */
function removeDailySync() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;

  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'syncCSVFromGitHub') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  Logger.log("Removed " + removed + " sync triggers");
}
