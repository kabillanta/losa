const fs = require('fs');

const eventNames = [
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
  "Quiz Finals",
  "Teacher's Quiz",
  "Valedictory & Championship Awards"
];

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const events = eventNames.map(name => ({
  name: name,
  slug: generateSlug(name),
  description: `${name} event.`,
  judges: ["Judge 1", "Judge 2"],
  rubric: [
    { "id": "criteria1", "name": "Criteria 1", "max_points": 20 },
    { "id": "criteria2", "name": "Criteria 2", "max_points": 20 },
    { "id": "overall", "name": "Overall Impact", "max_points": 10 }
  ]
}));

const config = { events };

fs.writeFileSync('events-config.json', JSON.stringify(config, null, 2));
console.log("events-config.json updated!");
