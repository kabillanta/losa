const fs = require('fs');
const path = require('path');

const allowedEvents = [
  "Fashionista",
  "Groove It Up",
  "Art to Heart",
  "Upcycle Challenge",
  "Rangoli",
  "Spectacular Science",
  "Brainy Duo",
  "Creative Writing",
  "Dumb Charades",
  "Spell Bee",
  "Guru Shisya",
  "Coding Champion",
  "Commerce IPL",
  "Quizzipedia",
  "Academic Marathon",
  "Debate",
  "Solo Singing",
  "Duo Singing",
  "Instrumental",
  "Battle of Bands",
  "Short Film",
  "Photography",
  "Ad-Zap",
  "Reel Making",
  "Corporate Walk",
  "Talent Showcase",
  "Teacher's Quiz"
];

const configPath = path.join(__dirname, '../events-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Filter out events that are not in the allowed list
const originalCount = config.events.length;
config.events = config.events.filter(event => allowedEvents.includes(event.name));
const newCount = config.events.length;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`Successfully removed ${originalCount - newCount} events. Total events remaining: ${newCount}`);
