/**
 * NHL Player Name Mapper
 *
 * Provides normalization and mapping between various player name formats
 * (last name only, nickname, alternate spellings) and official NHL API names.
 */

/**
 * Player aliases - Maps various name formats to standardized "FirstName LastName"
 * Used for matching player names from your CSV to NHL API player data
 */
var PLAYER_ALIASES = {
  // Edmonton Oilers
  "Draisaitl": "Leon Draisaitl",
  "Leon Draisaitl": "Leon Draisaitl",
  "McDavid": "Connor McDavid",
  "Connor McDavid": "Connor McDavid",

  // Tampa Bay Lightning
  "Hagel": "Brandon Hagel",
  "Brandon Hagel": "Brandon Hagel",
  "Kucherov": "Nikita Kucherov",
  "Nikita Kucherov": "Nikita Kucherov",
  "Point": "Brayden Point",
  "Brayden Point": "Brayden Point",

  // Los Angeles Kings
  "Kempe": "Adrian Kempe",
  "Adrian Kempe": "Adrian Kempe",
  "Kopitar": "Anze Kopitar",
  "Anze Kopitar": "Anze Kopitar",

  // Pittsburgh Penguins
  "Crosby": "Sidney Crosby",
  "Sidney Crosby": "Sidney Crosby",
  "Guentzel": "Jake Guentzel",
  "Jake Guentzel": "Jake Guentzel",

  // Carolina Hurricanes
  "Jarvis": "Seth Jarvis",
  "Seth Jarvis": "Seth Jarvis",
  "Necas": "Martin Necas",
  "Martin Necas": "Martin Necas",
  "Aho": "Sebastian Aho",
  "Sebastian Aho": "Sebastian Aho",

  // Buffalo Sabres
  "Thompson": "Tage Thompson",
  "Tage Thompson": "Tage Thompson",
  "Dahlin": "Rasmus Dahlin",
  "Rasmus Dahlin": "Rasmus Dahlin",

  // Toronto Maple Leafs
  "Marner": "Mitch Marner",
  "Mitch Marner": "Mitch Marner",
  "Matthews": "Auston Matthews",
  "Auston Matthews": "Auston Matthews",
  "Nylander": "William Nylander",
  "William Nylander": "William Nylander",
  "Tavares": "John Tavares",
  "John Tavares": "John Tavares",
  "Knies": "Matthew Knies",
  "Matthew Knies": "Matthew Knies",

  // Boston Bruins
  "Marchand": "Brad Marchand",
  "Brad Marchand": "Brad Marchand",
  "Marchand ": "Brad Marchand",  // Handle trailing space
  "Pastrnak": "David Pastrnak",
  "David Pastrnak": "David Pastrnak",

  // New Jersey Devils
  "J Hughes": "Jack Hughes",
  "Jack Hughes": "Jack Hughes",
  "Hughes": "Jack Hughes",
  "Hischier": "Nico Hischier",
  "Nico Hischier": "Nico Hischier",

  // San Jose Sharks
  "Celebrini": "Macklin Celebrini",
  "Macklin Celebrini": "Macklin Celebrini",
  "Celebrini ": "Macklin Celebrini",  // Handle trailing space

  // Detroit Red Wings
  "DeBrincat": "Alex DeBrincat",
  "Alex DeBrincat": "Alex DeBrincat",
  "Larkin": "Dylan Larkin",
  "Dylan Larkin": "Dylan Larkin",

  // St. Louis Blues
  "Kyrou": "Jordan Kyrou",
  "Jordan Kyrou": "Jordan Kyrou",

  // Columbus Blue Jackets
  "Marchenko": "Kirill Marchenko",
  "Kirill Marchenko": "Kirill Marchenko",
  "Marchenko ": "Kirill Marchenko",  // Handle trailing space
  "Fantilli": "Adam Fantilli",
  "Adam Fantilli": "Adam Fantilli",

  // Vegas Golden Knights
  "Dorofeyev": "Pavel Dorofeyev",
  "Pavel Dorofeyev": "Pavel Dorofeyev",
  "Eichel": "Jack Eichel",
  "Jack Eichel": "Jack Eichel",

  // Washington Capitals
  "Protas": "Aliaksei Protas",
  "Aliaksei Protas": "Aliaksei Protas",
  "Protas ": "Aliaksei Protas",  // Handle trailing space
  "Ovechkin": "Alex Ovechkin",
  "Alex Ovechkin": "Alex Ovechkin",

  // Florida Panthers
  "Reinhart": "Sam Reinhart",
  "Sam Reinhart": "Sam Reinhart",
  "Barkov": "Aleksander Barkov",
  "Aleksander Barkov": "Aleksander Barkov",

  // Dallas Stars
  "Robertson": "Jason Robertson",
  "Jason Robertson": "Jason Robertson",

  // Buffalo Sabres (additional)
  "Tuch": "Alex Tuch",
  "Alex Tuch": "Alex Tuch",

  // Minnesota Wild
  "Fiala": "Kevin Fiala",
  "Kevin Fiala": "Kevin Fiala",
  "Kaprizov": "Kirill Kaprizov",
  "Kirill Kaprizov": "Kirill Kaprizov",

  // Edmonton Oilers (additional)
  "Hyman": "Zach Hyman",
  "Zach Hyman": "Zach Hyman",

  // Colorado Avalanche
  "Rantanen": "Mikko Rantanen",
  "Mikko Rantanen": "Mikko Rantanen",
  "MacKinnon": "Nathan MacKinnon",
  "Nathan MacKinnon": "Nathan MacKinnon",

  // Dallas Stars (additional)
  "Johnston": "Wyatt Johnston",
  "Wyatt Johnston": "Wyatt Johnston",

  // Nashville Predators
  "Forsberg": "Filip Forsberg",
  "Filip Forsberg": "Filip Forsberg",

  // Winnipeg Jets
  "Connor": "Kyle Connor",
  "Kyle Connor": "Kyle Connor",
  "Scheifele": "Mark Scheifele",
  "Mark Scheifele": "Mark Scheifele",

  // Montreal Canadiens
  "Caufield": "Cole Caufield",
  "Cole Caufield": "Cole Caufield",

  // Arizona Coyotes / Utah
  "Keller": "Clayton Keller",
  "Clayton Keller": "Clayton Keller",

  // New York Rangers
  "Panarin": "Artemi Panarin",
  "Artemi Panarin": "Artemi Panarin",

  // Chicago Blackhawks
  "Bedard": "Connor Bedard",
  "Connor Bedard": "Connor Bedard",

  // Philadelphia Flyers
  "Gauthier": "Cutter Gauthier",
  "Cutter Gauthier": "Cutter Gauthier"
};

/**
 * Normalize a player name to the official NHL format
 *
 * @param {string} playerName - Player name in any format
 * @returns {string|null} Normalized "FirstName LastName", or null if not found
 */
function normalizePlayerName(playerName) {
  if (!playerName) {
    return null;
  }

  // Trim and handle empty strings
  var trimmed = playerName.toString().trim();
  if (trimmed === "") {
    return null;
  }

  // Try direct lookup
  if (PLAYER_ALIASES[trimmed]) {
    return PLAYER_ALIASES[trimmed];
  }

  // Try case-insensitive match
  var lowerTrimmed = trimmed.toLowerCase();
  for (var alias in PLAYER_ALIASES) {
    if (alias.toLowerCase() === lowerTrimmed) {
      return PLAYER_ALIASES[alias];
    }
  }

  // If not found, log warning and return the original (might still match API)
  Logger.log("WARNING: Player name '" + playerName + "' not found in aliases, using as-is");
  return trimmed;
}

/**
 * Get list of all mapped players
 *
 * @returns {Array<string>} Sorted array of normalized player names
 */
function getAllMappedPlayers() {
  var players = {};
  for (var alias in PLAYER_ALIASES) {
    var normalized = PLAYER_ALIASES[alias];
    players[normalized] = true;
  }

  var playerList = [];
  for (var player in players) {
    playerList.push(player);
  }

  return playerList.sort();
}

/**
 * Test function to verify player name normalization
 */
function testPlayerNameNormalization() {
  var testCases = [
    "Draisaitl",
    "Leon Draisaitl",
    "McDavid",
    "J Hughes",
    "Marchand ",
    "Invalid Player"
  ];

  Logger.log("=== Player Name Normalization Tests ===");
  testCases.forEach(function(testName) {
    var normalized = normalizePlayerName(testName);
    Logger.log("Input: '" + testName + "' => Output: '" + (normalized || "NOT FOUND") + "'");
  });
}
