const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../events-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

config.events = config.events.map(event => ({
  ...event,
  max_teams: 1 // Default to 1
}));

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Updated events-config.json with max_teams');
