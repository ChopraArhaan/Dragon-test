import test from 'node:test';
import assert from 'node:assert/strict';
import { growthFor, moodFor, hungerFor, detectActivity } from '../src/pet.js';
import { buildContributionMap, computeStreaks } from '../src/streak.js';

test('growth thresholds are inclusive at the lower bound', () => {
  assert.equal(growthFor(0).id, 'egg');
  assert.equal(growthFor(49).id, 'egg');
  assert.equal(growthFor(50).id, 'hatchling');
  assert.equal(growthFor(199).id, 'hatchling');
  assert.equal(growthFor(200).id, 'young');
  assert.equal(growthFor(599).id, 'young');
  assert.equal(growthFor(600).id, 'adult');
  assert.equal(growthFor(1499).id, 'adult');
  assert.equal(growthFor(1500).id, 'elder');
});

test('egg cracks faster near fifty commits', () => {
  assert.equal(growthFor(0).eggCrack, 0);
  assert.ok(growthFor(40).eggCrack > growthFor(20).eggCrack);
  assert.equal(growthFor(49).eggCrack, 0.98);
});

test('mood uses rest days before today activity', () => {
  assert.equal(moodFor({ commitsToday: 0, daysSinceLastCommit: 0 }).id, 'sleepy');
  assert.equal(moodFor({ commitsToday: 2, daysSinceLastCommit: 0 }).id, 'happy');
  assert.equal(moodFor({ commitsToday: 6, daysSinceLastCommit: 0 }).id, 'hyper');
  assert.equal(moodFor({ commitsToday: 12, daysSinceLastCommit: 0 }).id, 'onFire');
  assert.equal(moodFor({ commitsToday: 0, daysSinceLastCommit: 1 }).id, 'peckish');
  assert.equal(moodFor({ commitsToday: 0, daysSinceLastCommit: 3 }).id, 'hungry');
  assert.equal(moodFor({ commitsToday: 0, daysSinceLastCommit: 7 }).id, 'sulking');
  assert.equal(moodFor({ commitsToday: 0, daysSinceLastCommit: 14 }).id, 'asleep');
  assert.equal(moodFor({ commitsToday: 0, daysSinceLastCommit: null }).id, 'asleep');
});

test('hunger drains daily and refills on a commit day', () => {
  assert.equal(hungerFor({ daysSinceLastCommit: 0, commitsToday: 0 }), 100);
  assert.equal(hungerFor({ daysSinceLastCommit: 1, commitsToday: 0 }), 91);
  assert.equal(hungerFor({ daysSinceLastCommit: 3, commitsToday: 0 }), 73);
  assert.equal(hungerFor({ daysSinceLastCommit: 15, commitsToday: 0 }), 0);
  assert.ok(hungerFor({ daysSinceLastCommit: 1, commitsToday: 3 }) > hungerFor({ daysSinceLastCommit: 1, commitsToday: 0 }));
});

test('streaks include today and continue from yesterday', () => {
  const days = [
    { date: '2026-11-10', contributionCount: 1 },
    { date: '2026-11-11', contributionCount: 2 },
    { date: '2026-11-12', contributionCount: 0 },
    { date: '2026-11-13', contributionCount: 1 },
    { date: '2026-11-14', contributionCount: 1 },
    { date: '2026-11-15', contributionCount: 1 },
    { date: '2026-11-16', contributionCount: 1 },
    { date: '2026-11-17', contributionCount: 1 },
    { date: '2026-11-18', contributionCount: 3 }
  ];
  const map = buildContributionMap(days);
  const streak = computeStreaks(map, '2026-11-18');
  assert.equal(streak.current, 6);
  assert.equal(streak.longest, 6);
  assert.equal(streak.activeDays, 8);
});

test('current streak survives until a whole day has been missed', () => {
  const days = [
    { date: '2026-11-16', contributionCount: 1 },
    { date: '2026-11-17', contributionCount: 1 },
    { date: '2026-11-18', contributionCount: 0 }
  ];
  const streak = computeStreaks(buildContributionMap(days), '2026-11-18');
  assert.equal(streak.current, 2);
});

test('longest streak can cross a year boundary', () => {
  const days = [
    { date: '2025-12-30', contributionCount: 1 },
    { date: '2025-12-31', contributionCount: 1 },
    { date: '2026-01-01', contributionCount: 1 },
    { date: '2026-01-02', contributionCount: 1 },
    { date: '2026-01-05', contributionCount: 1 }
  ];
  const streak = computeStreaks(buildContributionMap(days), '2026-01-05');
  assert.equal(streak.longest, 4);
  assert.equal(streak.current, 1);
});

test('activity reactions are change-based and streak break is stateful', () => {
  const weekly = { weekStart: '2026-11-16', prsOpened: 2, prsMerged: 2, issuesClosed: 1, reviews: 2 };
  const data = {
    totalStars: 10,
    followers: 50,
    currentStreak: 0,
    daysSinceLastCommit: 2,
    weekly
  };
  const previous = {
    totalStars: 9,
    followers: 42,
    currentStreak: 8,
    weekly: { ...weekly, prsMerged: 1, issuesClosed: 0, reviews: 1 }
  };
  const result = detectActivity(data, previous);
  assert.equal(result.streakBroken, true);
  assert.ok(result.events.some((event) => event.type === 'prMerged'));
  assert.ok(result.events.some((event) => event.type === 'issueClosed'));
  assert.ok(result.events.some((event) => event.type === 'review'));
  assert.ok(result.events.some((event) => event.type === 'newStar'));
  assert.ok(result.events.some((event) => event.type === 'followers' && event.milestone === 50));
  assert.equal(result.primary.type, 'prMerged');
});
