const fs = require('fs');
const config = require('../events-config.json');

config.events = config.events.map(event => ({
  ...event,
  min_size: 1,
  max_size: 5 // Default max size, can be tweaked later
}));

fs.writeFileSync('events-config.json', JSON.stringify(config, null, 2));
console.log('Added min_size and max_size to all events!');
