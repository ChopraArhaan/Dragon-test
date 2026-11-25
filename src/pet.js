import { isLateNight, isWeekend, timeOfDay, formatClock } from './time.js';

export const STAGES = [
  {
    id: 'egg',
    label: 'Egg',
    title: 'Mystery Egg',
    min: 0,
    max: 50,
    blurb: 'Something is stirring inside.',
    accent: '#8ED8B5'
  },
  {
    id: 'hatchling',
    label: 'Hatchling',
    title: 'Hatchling',
    min: 50,
    max: 200,
    blurb: 'Tiny wings. Enormous ambition.',
    accent: '#6FE0BF'
  },
  {
    id: 'young',
    label: 'Young Dragon',
    title: 'Young Dragon',
    min: 200,
    max: 600,
    blurb: 'First flight. First flame.',
    accent: '#F2C14E'
  },
  {
    id: 'adult',
    label: 'Adult Dragon',
    title: 'Adult Dragon',
    min: 600,
    max: 1500,
    blurb: 'Steady wings. Steady fire.',
    accent: '#F08A5D'
  },
  {
    id: 'elder',
    label: 'Elder Dragon',
    title: 'Elder Dragon',
    min: 1500,
    max: Infinity,
    blurb: 'A legend with golden scales.',
    accent: '#FFD86B'
  }
];

export const MOODS = {
  sleepy: {
    label: 'Sleepy',
    copy: 'five more minutes...',
    short: 'sleepy'
  },
  happy: {
    label: 'Happy',
    copy: 'tail wagging!',
    short: 'happy'
  },
  hyper: {
    label: 'Hyper',
    copy: 'ZOOMIES!!',
    short: 'hyper'
  },
  onFire: {
    label: 'On Fire',
    copy: "I'M ON FIRE!",
    short: 'on fire'
  },
  peckish: {
    label: 'Peckish',
    copy: 'snack? commits?',
    short: 'peckish'
  },
  hungry: {
    label: 'Hungry',
    copy: 'FEED ME COMMITS',
    short: 'hungry'
  },
  sulking: {
    label: 'Sulking',
    copy: 'hmph.',
    short: 'sulking'
  },
  asleep: {
    label: 'Asleep',
    copy: 'zzz...',
    short: 'asleep'
  }
};

const MILESTONES = [10, 50, 100, 500];

const EVENT_COPY = {
  prMerged: 'MERGED! ROAR!',
  newStar: 'a new star!',
  followers: 'party time!',
  issueClosed: 'treasure secured!',
  prOpened: 'flag raised!',
  review: 'review mode: on'
};

const EVENT_PRIORITY = ['prMerged', 'newStar', 'followers', 'issueClosed', 'prOpened', 'review'];

export function growthFor(totalCommits) {
  const total = Math.max(0, Number(totalCommits) || 0);
  const index = STAGES.findIndex((stage) => total < stage.max);
  const stage = STAGES[index === -1 ? STAGES.length - 1 : index];
  const isMax = stage.max === Infinity;
  const span = isMax ? 1 : stage.max - stage.min;
  const progress = isMax ? 1 : Math.max(0, Math.min(1, (total - stage.min) / span));
  return {
    ...stage,
    index: index === -1 ? STAGES.length - 1 : index,
    ordinal: (index === -1 ? STAGES.length - 1 : index) + 1,
    of: STAGES.length,
    progress,
    nextAt: isMax ? null : stage.max,
    remaining: isMax ? 0 : Math.max(0, stage.max - total),
    eggCrack: stage.id === 'egg' ? Math.max(0, Math.min(1, total / stage.max)) : 0
  };
}

export function moodFor(data) {
  const days = data.daysSinceLastCommit;
  const today = data.commitsToday || 0;

  if (days == null || days >= 14) return { id: 'asleep', ...MOODS.asleep };
  if (days >= 7) return { id: 'sulking', ...MOODS.sulking };
  if (days >= 3) return { id: 'hungry', ...MOODS.hungry };
  if (days >= 1) return { id: 'peckish', ...MOODS.peckish };
  if (today >= 10) return { id: 'onFire', ...MOODS.onFire };
  if (today >= 5) return { id: 'hyper', ...MOODS.hyper };
  if (today >= 1) return { id: 'happy', ...MOODS.happy };
  return { id: 'sleepy', ...MOODS.sleepy };
}

export function hungerFor(data) {
  const days = data.daysSinceLastCommit;
  if (days == null) return 0;
  const todayRefill = Math.min(35, (data.commitsToday || 0) * 7);
  const value = 100 - days * 9 + todayRefill;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function hungerLabel(value) {
  if (value >= 90) return 'FULL';
  if (value >= 74) return 'CONTENT';
  if (value >= 50) return 'PECKISH';
  if (value >= 25) return 'HUNGRY';
  return 'STARVING';
}

function crossedMilestone(previous, current) {
  if (previous == null) return null;
  return MILESTONES.filter((milestone) => previous < milestone && current >= milestone).at(-1) || null;
}

function increased(previous, current) {
  return Number.isFinite(previous) && Number(current) > Number(previous);
}

export function detectActivity(data, previous) {
  const events = [];
  let streakBroken = false;

  if (previous) {
    if (increased(previous.totalStars, data.totalStars)) {
      events.push({ type: 'newStar', amount: data.totalStars - previous.totalStars });
    }

    const milestone = crossedMilestone(previous.followers, data.followers);
    if (milestone) events.push({ type: 'followers', milestone });

    const sameWeek = previous.weekly?.weekStart === data.weekly?.weekStart;
    if (sameWeek) {
      if (increased(previous.weekly?.prsMerged, data.weekly?.prsMerged)) events.push({ type: 'prMerged' });
      if (increased(previous.weekly?.prsOpened, data.weekly?.prsOpened)) events.push({ type: 'prOpened' });
      if (increased(previous.weekly?.issuesClosed, data.weekly?.issuesClosed)) {
        events.push({ type: 'issueClosed' });
      }
      if (increased(previous.weekly?.reviews, data.weekly?.reviews)) events.push({ type: 'review' });
    }

    if (previous.currentStreak >= 3 && data.currentStreak === 0 && (data.daysSinceLastCommit ?? 0) >= 1) {
      streakBroken = true;
    }
  }

  events.sort((a, b) => EVENT_PRIORITY.indexOf(a.type) - EVENT_PRIORITY.indexOf(b.type));
  const primary = events[0] || null;
  return {
    events,
    primary,
    streakBroken,
    copy: primary ? EVENT_COPY[primary.type] : null
  };
}

export function derivePet(data, previous, now) {
  const growth = growthFor(data.totalCommits);
  const mood = moodFor(data);
  const hunger = hungerFor(data);
  const activity = detectActivity(data, previous);
  const latest = data.latestCommit;
  const lateNight = Boolean(latest && isLateNight(latest.localHour));
  const weekend = Boolean(latest && isWeekend(latest.localWeekday));
  const eventTypes = new Set(activity.events.map((event) => event.type));

  const rewards = {
    scarf: data.currentStreak >= 3,
    crown: data.currentStreak >= 7,
    goldenAura: data.currentStreak >= 30 || growth.id === 'elder',
    flameWings: data.currentStreak >= 100,
    shinyScales: data.currentStreak >= 30 || growth.id === 'elder'
  };

  const accessories = {
    crown: rewards.crown,
    scarf: rewards.scarf,
    goldenAura: rewards.goldenAura,
    flameWings: rewards.flameWings,
    shinyScales: rewards.shinyScales,
    droopyWings: activity.streakBroken,
    nightCap: lateNight,
    coffee: lateNight,
    beach: weekend,
    sunglasses: weekend,
    glasses: eventTypes.has('review'),
    heartEyes: eventTypes.has('newStar'),
    flag: eventTypes.has('prOpened'),
    coin: eventTypes.has('issueClosed'),
    partyHat: eventTypes.has('followers'),
    confetti: eventTypes.has('prMerged') || eventTypes.has('followers'),
    roar: eventTypes.has('prMerged') || mood.id === 'hungry',
    proud: eventTypes.has('issueClosed'),
    companion: companionFor(data.language?.name)
  };

  const activeRewards = [
    rewards.scarf && 'SCARF',
    rewards.crown && 'CROWN',
    rewards.goldenAura && (growth.id === 'elder' ? 'ELDER AURA' : 'GOLDEN AURA'),
    rewards.flameWings && 'FLAME WINGS'
  ].filter(Boolean);

  const latestTimeOfDay = latest ? timeOfDay(latest.localHour) : 'unknown';
  const latestClock = latest ? formatClock(latest.localHour, latest.localMinute) : '—';

  return {
    growth,
    mood,
    hunger,
    hungerLabel: hungerLabel(hunger),
    activity,
    rewards,
    accessories,
    activeRewards,
    lateNight,
    weekend,
    latestTimeOfDay,
    latestClock,
    copy:
      activity.copy ||
      (activity.streakBroken
        ? 'come back!'
        : mood.id === 'asleep'
          ? 'zzz...'
          : mood.copy),
    reactions: eventTypes,
    now
  };
}

export function companionFor(language) {
  const name = (language || '').toLowerCase();
  if (name === 'python') return 'python';
  if (name === 'javascript') return 'javascript';
  if (name === 'typescript') return 'typescript';
  if (name === 'rust') return 'rust';
  if (name === 'go') return 'go';
  if (name === 'java') return 'java';
  if (name === 'ruby') return 'ruby';
  if (name === 'c' || name === 'c++' || name === 'c#') return 'blade';
  if (name === 'html' || name === 'css' || name === 'scss') return 'brush';
  if (name === 'shell' || name === 'powershell') return 'terminal';
  return 'gem';
}

export function previousStateShape() {
  return {
    schemaVersion: 1,
    generatedAt: null,
    login: null,
    totalCommits: null,
    currentStreak: null,
    longestStreak: null,
    totalStars: null,
    followers: null,
    hunger: null,
    language: null,
    weekly: null,
    latestCommitAt: null
  };
}

export function stateFor(data, pet, now) {
  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    login: data.login,
    totalCommits: data.totalCommits,
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    totalStars: data.totalStars,
    followers: data.followers,
    hunger: pet.hunger,
    language: data.language?.name || null,
    weekly: data.weekly,
    latestCommitAt: data.latestCommit?.timestamp || null
  };
}
