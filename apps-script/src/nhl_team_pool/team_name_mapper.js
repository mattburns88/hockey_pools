/**
 * NHL Team Name Mapper
 *
 * Provides normalization and mapping between various team name formats
 * (abbreviations, alternate names, common variations) and official NHL API names.
 */

/**
 * Official NHL team names as returned by the API (teamName.default)
 */
var NHL_OFFICIAL_TEAMS = {
  "ANA": "Anaheim Ducks",
  "BOS": "Boston Bruins",
  "BUF": "Buffalo Sabres",
  "CGY": "Calgary Flames",
  "CAR": "Carolina Hurricanes",
  "CHI": "Chicago Blackhawks",
  "COL": "Colorado Avalanche",
  "CBJ": "Columbus Blue Jackets",
  "DAL": "Dallas Stars",
  "DET": "Detroit Red Wings",
  "EDM": "Edmonton Oilers",
  "FLA": "Florida Panthers",
  "LAK": "Los Angeles Kings",
  "MIN": "Minnesota Wild",
  "MTL": "Montréal Canadiens",
  "NSH": "Nashville Predators",
  "NJD": "New Jersey Devils",
  "NYI": "New York Islanders",
  "NYR": "New York Rangers",
  "OTT": "Ottawa Senators",
  "PHI": "Philadelphia Flyers",
  "PIT": "Pittsburgh Penguins",
  "SJS": "San Jose Sharks",
  "SEA": "Seattle Kraken",
  "STL": "St. Louis Blues",
  "TBL": "Tampa Bay Lightning",
  "TOR": "Toronto Maple Leafs",
  "UTA": "Utah Mammoth",
  "VAN": "Vancouver Canucks",
  "VGK": "Vegas Golden Knights",
  "WSH": "Washington Capitals",
  "WPG": "Winnipeg Jets"
};

/**
 * Alternate names and variations that might appear in user data
 * Maps variations to the official team abbreviation
 */
var TEAM_ALIASES = {
  // Full names
  "Anaheim Ducks": "ANA",
  "Boston Bruins": "BOS",
  "Buffalo Sabres": "BUF",
  "Calgary Flames": "CGY",
  "Carolina Hurricanes": "CAR",
  "Chicago Blackhawks": "CHI",
  "Colorado Avalanche": "COL",
  "Columbus Blue Jackets": "CBJ",
  "Dallas Stars": "DAL",
  "Detroit Red Wings": "DET",
  "Edmonton Oilers": "EDM",
  "Florida Panthers": "FLA",
  "Los Angeles Kings": "LAK",
  "Minnesota Wild": "MIN",
  "Montréal Canadiens": "MTL",
  "Montreal Canadiens": "MTL",  // Without accent
  "Nashville Predators": "NSH",
  "New Jersey Devils": "NJD",
  "New York Islanders": "NYI",
  "New York Rangers": "NYR",
  "Ottawa Senators": "OTT",
  "Philadelphia Flyers": "PHI",
  "Pittsburgh Penguins": "PIT",
  "San Jose Sharks": "SJS",
  "Seattle Kraken": "SEA",
  "St. Louis Blues": "STL",
  "St Louis Blues": "STL",  // Without period
  "Tampa Bay Lightning": "TBL",
  "Toronto Maple Leafs": "TOR",
  "Utah Hockey Club": "UTA",
  "Utah": "UTA",
  "Utah Mammoth" : "UTA",
  "Vancouver Canucks": "VAN",
  "Vegas Golden Knights": "VGK",
  "Washington Capitals": "WSH",
  "Winnipeg Jets": "WPG",

  // Abbreviations
  "ANA": "ANA",
  "BOS": "BOS",
  "BUF": "BUF",
  "CGY": "CGY",
  "CAR": "CAR",
  "CHI": "CHI",
  "COL": "COL",
  "CBJ": "CBJ",
  "DAL": "DAL",
  "DET": "DET",
  "EDM": "EDM",
  "FLA": "FLA",
  "LAK": "LAK",
  "LA": "LAK",
  "L.A": "LAK",
  "MIN": "MIN",
  "MTL": "MTL",
  "NSH": "NSH",
  "NJD": "NJD",
  "NJ": "NJD",
  "N.J": "NJD",
  "NYI": "NYI",
  "NYR": "NYR",
  "OTT": "OTT",
  "PHI": "PHI",
  "PIT": "PIT",
  "SJS": "SJS",
  "SJ": "SJS",
  "S.J": "SJS",
  "SEA": "SEA",
  "STL": "STL",
  "TBL": "TBL",
  "TB": "TBL",
  "T.B": "TBL",
  "TOR": "TOR",
  "UTA": "UTA",
  "VAN": "VAN",
  "VGK": "VGK",
  "WSH": "WSH",
  "WPG": "WPG",

  // Common variations
  "Ducks": "ANA",
  "Bruins": "BOS",
  "Sabres": "BUF",
  "Flames": "CGY",
  "Hurricanes": "CAR",
  "Blackhawks": "CHI",
  "Avalanche": "COL",
  "Blue Jackets": "CBJ",
  "Stars": "DAL",
  "Red Wings": "DET",
  "Oilers": "EDM",
  "Panthers": "FLA",
  "Kings": "LAK",
  "Wild": "MIN",
  "Canadiens": "MTL",
  "Habs": "MTL",
  "Predators": "NSH",
  "Preds": "NSH",
  "Devils": "NJD",
  "Islanders": "NYI",
  "Rangers": "NYR",
  "Senators": "OTT",
  "Sens": "OTT",
  "Flyers": "PHI",
  "Penguins": "PIT",
  "Pens": "PIT",
  "Sharks": "SJS",
  "Kraken": "SEA",
  "Blues": "STL",
  "Lightning": "TBL",
  "Bolts": "TBL",
  "Maple Leafs": "TOR",
  "Leafs": "TOR",
  "Canucks": "VAN",
  "Golden Knights": "VGK",
  "Knights": "VGK",
  "Capitals": "WSH",
  "Caps": "WSH",
  "Jets": "WPG"
};

/**
 * Normalize a team name to the official NHL API format
 *
 * @param {string} teamName - Team name in any format (abbreviation, full name, variation)
 * @returns {string|null} Official NHL team name, or null if not found
 */
function normalizeTeamName(teamName) {
  if (!teamName) {
    return null;
  }

  // Trim and handle empty strings
  var trimmed = teamName.toString().trim();
  if (trimmed === "") {
    return null;
  }

  // Check if it's already an official name
  for (var abbr in NHL_OFFICIAL_TEAMS) {
    if (NHL_OFFICIAL_TEAMS[abbr] === trimmed) {
      return trimmed;
    }
  }

  // Try to find in aliases
  var abbr = TEAM_ALIASES[trimmed];
  if (abbr && NHL_OFFICIAL_TEAMS[abbr]) {
    return NHL_OFFICIAL_TEAMS[abbr];
  }

  // Try case-insensitive match
  var lowerTrimmed = trimmed.toLowerCase();
  for (var alias in TEAM_ALIASES) {
    if (alias.toLowerCase() === lowerTrimmed) {
      var foundAbbr = TEAM_ALIASES[alias];
      return NHL_OFFICIAL_TEAMS[foundAbbr];
    }
  }

  // Not found
  Logger.log("WARNING: Could not normalize team name: '" + teamName + "'");
  return null;
}

/**
 * Normalize an array of team names
 *
 * @param {Array<string>} teamNames - Array of team names
 * @returns {Array<Object>} Array of objects with {original, normalized} properties
 */
function normalizeTeamNames(teamNames) {
  var results = [];

  teamNames.forEach(function(teamName) {
    results.push({
      original: teamName,
      normalized: normalizeTeamName(teamName)
    });
  });

  return results;
}

/**
 * Get all official NHL team names (for validation/reference)
 *
 * @returns {Array<string>} Sorted array of official team names
 */
function getOfficialTeamNames() {
  var teams = [];
  for (var abbr in NHL_OFFICIAL_TEAMS) {
    teams.push(NHL_OFFICIAL_TEAMS[abbr]);
  }
  return teams.sort();
}

/**
 * Get all team abbreviations
 *
 * @returns {Array<string>} Sorted array of team abbreviations
 */
function getTeamAbbreviations() {
  var abbrs = [];
  for (var abbr in NHL_OFFICIAL_TEAMS) {
    abbrs.push(abbr);
  }
  return abbrs.sort();
}

/**
 * Test function to verify team name normalization
 */
function testTeamNameNormalization() {
  var testCases = [
    "TOR",
    "Toronto Maple Leafs",
    "Leafs",
    "MTL",
    "Montreal Canadiens",
    "Montréal Canadiens",
    "Habs",
    "VGK",
    "Vegas Golden Knights",
    "Knights",
    "Invalid Team Name"
  ];

  Logger.log("=== Team Name Normalization Tests ===");
  testCases.forEach(function(testName) {
    var normalized = normalizeTeamName(testName);
    Logger.log("Input: '" + testName + "' => Output: '" + (normalized || "NOT FOUND") + "'");
  });
}
