import { addDaysToKey } from './time.js';

export function buildContributionMap(days) {
  const map = new Map();
  for (const day of days) {
    if (!day?.date) continue;
    const count = Number(day.contributionCount ?? day.count ?? 0);
    map.set(day.date, (map.get(day.date) || 0) + count);
  }
  return map;
}

export function computeStreaks(map, todayKey) {
  const active = [...map.entries()]
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort();

  let longest = 0;
  let run = 0;
  let previous = null;
  for (const date of active) {
    if (previous && addDaysToKey(previous, 1) === date) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    previous = date;
  }

  const yesterdayKey = addDaysToKey(todayKey, -1);
  let cursor = null;
  if ((map.get(todayKey) || 0) > 0) cursor = todayKey;
  else if ((map.get(yesterdayKey) || 0) > 0) cursor = yesterdayKey;

  let current = 0;
  while (cursor && (map.get(cursor) || 0) > 0) {
    current += 1;
    cursor = addDaysToKey(cursor, -1);
  }

  return {
    current,
    longest,
    activeDays: active.length,
    lastActiveDate: active.at(-1) || null
  };
}

export function sumCalendar(days) {
  const map = buildContributionMap(days);
  return [...map.values()].reduce((sum, count) => sum + count, 0);
}
