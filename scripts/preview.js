import fs from 'node:fs/promises';
import path from 'node:path';
import { derivePet } from '../src/pet.js';
import { renderCard } from '../src/templates/card.js';

const outDir = path.resolve('previews');
const now = new Date('2026-11-18T07:17:00Z');
const timeZone = 'Asia/Kolkata';
const weekStart = '2026-11-16';

function baseData(overrides = {}) {
  const data = {
    login: 'octocat',
    name: 'The Octocat',
    avatarUrl: '',
    createdAt: '2011-01-25T18:44:36Z',
    followers: 87,
    publicRepos: 8,
    totalStars: 412,
    totalCommits: 900,
    commitsToday: 2,
    commits7d: 14,
    currentStreak: 7,
    longestStreak: 31,
    activeDays: 280,
    daysSinceLastCommit: 0,
    latestCommit: {
      timestamp: Date.parse('2026-11-18T10:30:00+05:30'),
      iso: '2026-11-18T05:00:00.000Z',
      offsetMinutes: 330,
      localDate: '2026-11-18',
      localHour: 10,
      localMinute: 30,
      localWeekday: 3,
      sha: 'abc123',
      message: 'feat: teach the dragon to fly',
      repo: 'octocat/octocat',
      url: 'https://github.com/octocat/octocat/commit/abc123',
      daysAgo: 0
    },
    weekly: {
      weekStart,
      prsOpened: 2,
      prsMerged: 1,
      issuesClosed: 1,
      reviews: 3
    },
    language: {
      name: 'Python',
      percent: 46,
      bytes: 46000,
      color: '#3572A5',
      top: []
    },
    streakSource: 'contributions graph',
    contributionDays: 900,
    warnings: [],
    generatedAt: now.toISOString()
  };
  return { ...data, ...overrides };
}

function previousFrom(data, overrides = {}) {
  return {
    schemaVersion: 1,
    generatedAt: new Date(now.getTime() - 86400000).toISOString(),
    login: data.login,
    totalCommits: data.totalCommits - 1,
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    totalStars: data.totalStars,
    followers: data.followers,
    hunger: 80,
    language: data.language.name,
    weekly: { ...data.weekly },
    latestCommitAt: data.latestCommit.timestamp,
    ...overrides
  };
}

async function writeCard(name, data, previous = null) {
  const pet = derivePet(data, previous, now);
  const svg = renderCard({ data, pet, now, timeZone });
  await fs.writeFile(path.join(outDir, `${name}.svg`), svg, 'utf8');
  return { name, stage: pet.growth.title, mood: pet.mood.label, reactions: [...pet.reactions] };
}

await fs.mkdir(outDir, { recursive: true });
const index = [];

for (const [stage, total] of [
  ['egg', 18],
  ['hatchling', 120],
  ['young', 360],
  ['adult', 900],
  ['elder', 2600]
]) {
  const data = baseData({ totalCommits: total });
  index.push(await writeCard(`stage-${stage}`, data, previousFrom(data)));
}

const moodCases = {
  sleepy: { commitsToday: 0, currentStreak: 4, daysSinceLastCommit: 0 },
  happy: { commitsToday: 2, currentStreak: 4, daysSinceLastCommit: 0 },
  hyper: { commitsToday: 6, currentStreak: 8, daysSinceLastCommit: 0 },
  onFire: { commitsToday: 12, currentStreak: 12, daysSinceLastCommit: 0 },
  peckish: { commitsToday: 0, currentStreak: 0, daysSinceLastCommit: 1 },
  hungry: { commitsToday: 0, currentStreak: 0, daysSinceLastCommit: 3 },
  sulking: { commitsToday: 0, currentStreak: 0, daysSinceLastCommit: 8 },
  asleep: { commitsToday: 0, currentStreak: 0, daysSinceLastCommit: 20 }
};

for (const [mood, overrides] of Object.entries(moodCases)) {
  const data = baseData(overrides);
  index.push(await writeCard(`mood-${mood}`, data, previousFrom(data, {
    currentStreak: mood === 'sulking' || mood === 'asleep' ? 11 : data.currentStreak
  })));
}

const accessoryCases = {
  scarf: { data: { currentStreak: 4 } },
  crown: { data: { currentStreak: 8 } },
  'golden-aura': { data: { currentStreak: 35 } },
  'flame-wings': { data: { currentStreak: 105 } },
  glasses: { data: { weekly: { weekStart, prsOpened: 0, prsMerged: 0, issuesClosed: 0, reviews: 2 } }, prev: { weekly: { weekStart, prsOpened: 0, prsMerged: 0, issuesClosed: 0, reviews: 0 } } },
  'heart-eyes': { data: { totalStars: 413 }, prev: { totalStars: 412 } },
  'party-hat': { data: { followers: 50 }, prev: { followers: 42 } },
  flag: { data: { weekly: { weekStart, prsOpened: 3, prsMerged: 0, issuesClosed: 0, reviews: 0 } }, prev: { weekly: { weekStart, prsOpened: 2, prsMerged: 0, issuesClosed: 0, reviews: 0 } } },
  coin: { data: { weekly: { weekStart, prsOpened: 0, prsMerged: 0, issuesClosed: 2, reviews: 0 } }, prev: { weekly: { weekStart, prsOpened: 0, prsMerged: 0, issuesClosed: 1, reviews: 0 } } },
  merged: { data: { weekly: { weekStart, prsOpened: 1, prsMerged: 2, issuesClosed: 0, reviews: 0 } }, prev: { weekly: { weekStart, prsOpened: 1, prsMerged: 1, issuesClosed: 0, reviews: 0 } } },
  'night-cap': { data: { latestCommit: { ...baseData().latestCommit, localHour: 1, localMinute: 12, timestamp: Date.parse('2026-11-17T19:42:00Z') } } },
  beach: { data: { latestCommit: { ...baseData().latestCommit, localWeekday: 6, localDate: '2026-11-14' }, daysSinceLastCommit: 4, commitsToday: 0 } },
  'language-python': { data: { language: { name: 'Python', percent: 62, color: '#3572A5' } } },
  'language-javascript': { data: { language: { name: 'JavaScript', percent: 51, color: '#F1E05A' } } },
  'language-rust': { data: { language: { name: 'Rust', percent: 44, color: '#DEA584' } } },
  'streak-broken': { data: { currentStreak: 0, daysSinceLastCommit: 2 }, prev: { currentStreak: 9 } }
};

for (const [name, test] of Object.entries(accessoryCases)) {
  const data = baseData(test.data || {});
  const previous = previousFrom(data, test.prev || {});
  index.push(await writeCard(`accessory-${name}`, data, previous));
}

const groups = [
  ['Growth stages', index.filter((item) => item.name.startsWith('stage-'))],
  ['Moods', index.filter((item) => item.name.startsWith('mood-'))],
  ['Accessories and reactions', index.filter((item) => item.name.startsWith('accessory-'))]
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Profile dragon preview gallery</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; padding: 32px; background: #0b1320; color: #f7ecce; font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  h1 { color: #f2c14e; font-size: 20px; letter-spacing: 1px; }
  h2 { margin-top: 36px; color: #8fd7e8; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 18px; }
  figure { margin: 0; background: #111e31; border: 1px solid #263a57; border-radius: 12px; overflow: hidden; }
  img { display: block; width: 100%; height: auto; background: #0a1320; }
  figcaption { padding: 10px 14px; color: #8fa5c5; font-size: 11px; }
  a { color: #79e0c0; text-decoration: none; }
</style>
</head>
<body>
<h1>GitHub profile dragon — preview gallery</h1>
<p>Generated from sample data. Every card is the same renderer the workflow uses.</p>
${groups
  .map(
    ([heading, items]) => `<h2>${heading}</h2><div class="grid">${items
      .map(
        (item) => `<figure><a href="./${item.name}.svg"><img src="./${item.name}.svg" alt="${item.name}"></a><figcaption>${item.name} · ${item.stage} · ${item.mood}${item.reactions.length ? ` · ${item.reactions.join(', ')}` : ''}</figcaption></figure>`
      )
      .join('')}</div>`
  )
  .join('\n')}
</body>
</html>`;

await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf8');
console.log(`Wrote ${index.length} preview cards and previews/index.html`);
