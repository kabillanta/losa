const fs = require('fs');

const rawEvents = [
  { cat: "Tiny Tots (Pre-KG, LKG, UKG)", name: "தமிழ் அறநெறி கதைகள்", slug: "tamil-araneri-kathaigal" },
  { cat: "Tiny Tots (Pre-KG, LKG, UKG)", name: "Be Heroic: Heroes of Our Heritage", slug: "be-heroic" },
  { cat: "Tiny Tots (Pre-KG, LKG, UKG)", name: "Art to Heart", slug: "art-to-heart-tiny" },
  { cat: "Energetic Kids (Classes I-III)", name: "Art to Heart", slug: "art-to-heart-energetic" },
  { cat: "Energetic Kids (Classes I-III)", name: "Green Guardians: I am Off to Save Our Planet Earth", slug: "green-guardians" },
  { cat: "Energetic Kids (Classes I-III)", name: "Brainy Duo: The Young Scientist's Discovery", slug: "brainy-duo" },
  { cat: "Young Visionaries (Classes IV-VI)", name: "தமிழ் பேச்சு", slug: "tamil-pechu" },
  { cat: "Young Visionaries (Classes IV-VI)", name: "Spectacular Science - The Young Visionaries Expo", slug: "spectacular-science" },
  { cat: "Young Visionaries (Classes IV-VI)", name: "Spell Bee", slug: "spell-bee" },
  { cat: "Young Visionaries (Classes IV-VI)", name: "Quiz-Whiz India", slug: "quiz-whiz-india" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "Creative Writing (English)", slug: "creative-writing" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "UpCycle - Trash into Treasure", slug: "upcycle" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "Dumb Charades", slug: "dumb-charades-emerging" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "Quizzable Stars", slug: "quizzable-stars" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "Beat Breeze (Group Dance)", slug: "beat-breeze" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "தமிழோடு விளையாடு", slug: "tamilodu-vilaiyadu" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "Rangoli", slug: "rangoli" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "Academic Marathon", slug: "academic-marathon" },
  { cat: "Emerging Stars (Classes VII-IX)", name: "Nutrichef (Flameless Cooking)", slug: "nutrichef" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Business Tycoon", slug: "business-tycoon" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Sway & Sizzle (Group Dance)", slug: "sway-and-sizzle" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Quizzipedia", slug: "quizzipedia" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Harmony Unplugged", slug: "harmony-unplugged" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Quad Squad - Sync to the Beat", slug: "quad-squad" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Commerce - Ideas Premier League (CIPL)", slug: "cipl" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Coding Champion", slug: "coding-champion" },
  { cat: "Teen Trailblazers (Classes X-XII)", name: "Rolling Camera - Action", slug: "rolling-camera" },
  { cat: "Guru Dhakshina (Teachers)", name: "Teachers on Beat", slug: "teachers-on-beat" },
  { cat: "Guru Dhakshina (Teachers)", name: "Quizmas Tree", slug: "quizmas-tree" },
  { cat: "Guru Dhakshina (Teachers)", name: "Guru Shishya", slug: "guru-shishya" },
  { cat: "Guru Dhakshina (Teachers)", name: "Dumb Charades", slug: "dumb-charades-teachers" }
];

const builtEvents = rawEvents.map(e => ({
  name: e.name,
  slug: e.slug,
  category: e.cat,
  description: `Registration for ${e.name} event.`,
  judges: ["Judge 1", "Judge 2"],
  rubric: [
    { id: "criteria1", name: "Criteria 1", max_points: 50 },
    { id: "criteria2", name: "Criteria 2", max_points: 30 },
    { id: "overall", name: "Overall Impact", max_points: 20 }
  ],
  min_size: 1,
  max_size: 5,
  max_teams: 1
}));

fs.writeFileSync('./events-config.json', JSON.stringify({ events: builtEvents }, null, 2));
console.log('Successfully rebuilt events-config.json');
