import fs from 'node:fs/promises';
import path from 'node:path';
import { collectGitHubData } from './github.js';
import { derivePet, stateFor } from './pet.js';
import { renderCard } from './templates/card.js';
import { readState, writeState } from './state.js';
import { resolveTimeZone } from './time.js';

const now = new Date();
const token = process.env.PET_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const login = process.env.PET_USERNAME || process.env.GITHUB_REPOSITORY_OWNER || process.env.GITHUB_ACTOR;
const timeZone = resolveTimeZone(process.env.PET_TIMEZONE);
const outputPath = path.resolve(process.env.PET_OUTPUT || 'assets/pet.svg');
const statePath = path.resolve(process.env.PET_STATE || 'assets/pet-state.json');

if (!token) {
  console.error('Missing GitHub token. Set GITHUB_TOKEN (the workflow provides it) or PET_TOKEN.');
  process.exit(1);
}
if (!login) {
  console.error('Missing GitHub username. Set PET_USERNAME, or run inside GitHub Actions with GITHUB_REPOSITORY_OWNER set.');
  process.exit(1);
}

const previous = await readState(statePath);
const data = await collectGitHubData({ token, login, now, timeZone });
data.generatedAt = now.toISOString();
const pet = derivePet(data, previous, now);
const svg = renderCard({ data, pet, now, timeZone });
const state = stateFor(data, pet, now);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, svg, 'utf8');
await writeState(statePath, state);

const summary = [
  `Dragon updated for @${data.login}`,
  `${pet.growth.title} · ${pet.mood.label} · hunger ${pet.hunger}%`,
  `${data.commitsToday} today / ${data.commits7d} in 7d / ${data.totalCommits} total`,
  `${data.currentStreak}d streak / ${data.longestStreak}d best`,
  `SVG: ${outputPath}`
].join('\n');
console.log(summary);

if (data.warnings.length) {
  console.warn('Warnings:');
  for (const warning of data.warnings) console.warn(`- ${warning}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = [
    '## GitHub profile dragon',
    '',
    `- Stage: **${pet.growth.title}** (${data.totalCommits} commits)`,
    `- Mood: **${pet.mood.label}**`,
    `- Hunger: **${pet.hunger}%**`,
    `- Today / 7 days / lifetime: **${data.commitsToday} / ${data.commits7d} / ${data.totalCommits}**`,
    `- Current / longest streak: **${data.currentStreak} / ${data.longestStreak}**`,
    `- This week: **${data.weekly.prsOpened} PRs opened, ${data.weekly.prsMerged} merged, ${data.weekly.issuesClosed} issues closed, ${data.weekly.reviews} reviews**`,
    `- Stars / followers: **${data.totalStars} / ${data.followers}**`,
    `- Top language: **${data.language?.name || 'unknown'}**`,
    '',
    `Generated \`${path.relative(process.cwd(), outputPath)}\` for ${now.toISOString()}.`
  ];
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`, 'utf8');
}
