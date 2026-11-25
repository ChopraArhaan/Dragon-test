import { UI, STAGE_PALETTES } from './palette.js';
import { esc, rect, pixelRoundRect, text } from './primitives.js';
import { sceneForNow, formatShortDate } from '../time.js';
import { renderBackdrop, scenePalette } from './scenes.js';
import { renderDragon, dragonAnchors } from './stages.js';
import { hungerBar, confetti } from './effects.js';

const WIDTH = 960;
const HEIGHT = 480;
const SCENE_WIDTH = 640;
const SIDEBAR_X = 640;
const GROUND_Y = 376;

function compact(value) {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 100_000) return `${Math.round(n / 1000)}k`;
  return new Intl.NumberFormat('en-US').format(n);
}

function clampText(value, maxChars) {
  const str = String(value ?? '').trim();
  return str.length > maxChars ? `${str.slice(0, maxChars - 1)}…` : str;
}

function wrap(textValue, maxChars) {
  const words = String(textValue).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= maxChars) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function eventText(pet) {
  const primary = pet.activity.primary;
  if (!primary) return null;
  if (primary.type === 'followers') return `${primary.milestone} FOLLOWERS!`;
  if (primary.type === 'newStar') return primary.amount > 1 ? 'NEW STARS!' : 'A NEW STAR!';
  return pet.copy;
}

function bubbleCta(pet) {
  if (pet.activity.streakBroken) return 'come back!';
  return eventText(pet) || pet.copy;
}

function statRow(x, y, label, value, options = {}) {
  const { valueSize = 16, valueColor = UI.cream, valueWeight = 700, labelColor = UI.faint } = options;
  return `${pixelRoundRect(x, y, 288, 34, 2, UI.panelAlt, 'opacity=".55"')}${text(
    x + 12,
    y + 11,
    label,
    { size: 8.5, fill: labelColor, weight: 700, letter: 1.2 }
  )}${text(x + 12, y + 27, value, {
    size: valueSize,
    fill: valueColor,
    weight: valueWeight,
    letter: 0.2
  })}`;
}

function stageMoodBar(growth, mood) {
  const cells = Array.from({ length: growth.of }, (_, index) => {
    const active = index < growth.ordinal;
    const current = index === growth.ordinal - 1;
    const fill = current ? UI.gold : active ? '#4E9C7C' : '#22344E';
    return rect(664 + index * 56, 91, 48, 7, fill, current ? 'opacity="1"' : 'opacity=".9"');
  }).join('');
  return `<g>${cells}${text(664, 114, `STAGE ${String(growth.ordinal).padStart(2, '0')} / 0${growth.of} · ${growth.title.toUpperCase()}`, {
    size: 9,
    fill: UI.gold,
    weight: 700,
    letter: 1.1
  })}${text(664, 132, growth.nextAt ? `${compact(growth.remaining)} COMMITS TO ${nextStageName(growth)}` : 'MAX LEVEL · LEGENDARY', {
    size: 8.5,
    fill: UI.faint,
    weight: 600,
    letter: 0.7
  })}${text(936, 114, `MOOD ${mood.short.toUpperCase()}`, {
    size: 8.5,
    fill: moodColor(mood.id),
    weight: 700,
    anchor: 'end',
    letter: 0.8
  })}</g>`;
}

function nextStageName(growth) {
  const names = ['HATCHLING', 'YOUNG DRAGON', 'ADULT DRAGON', 'ELDER DRAGON'];
  return names[Math.min(growth.ordinal - 1, names.length - 1)];
}

function moodColor(mood) {
  if (mood === 'onFire') return '#FF8A3D';
  if (mood === 'hyper') return '#8DE8FF';
  if (mood === 'happy') return '#79E0C0';
  if (mood === 'hungry' || mood === 'peckish') return '#F2C14E';
  if (mood === 'sulking') return '#C68A9A';
  return '#9CB0CE';
}

function sceneBadges(scene, pet, p, now, timeZone) {
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone
  }).format(now).toUpperCase();
  return `<g>${pixelRoundRect(18, 18, 252, 24, 3, '#0B1523', 'opacity=".82"')}${text(30, 34, `${pet.growth.title.toUpperCase()} · ${pet.growth.ordinal}/5`, {
    size: 9,
    fill: UI.gold,
    weight: 700,
    letter: 1.3
  })}${text(SCENE_WIDTH - 20, 30, scene.label, {
    size: 8.5,
    fill: p.text,
    weight: 700,
    anchor: 'end',
    letter: 1.4,
    opacity: 0.72
  })}${text(SCENE_WIDTH - 20, 43, date, {
    size: 7.5,
    fill: p.text,
    anchor: 'end',
    letter: 1,
    opacity: 0.48
  })}</g>`;
}

function speech(pet) {
  const lines = wrap(bubbleCta(pet).toUpperCase(), 25);
  if (pet.activity.primary?.type === 'prMerged') lines[0] = 'MERGED! ROAR!';
  if (pet.activity.primary?.type === 'followers') lines[0] = `${pet.activity.primary.milestone} FOLLOWERS!`;
  const fill = pet.activity.primary?.type === 'newStar'
    ? '#FFE1EA'
    : pet.activity.primary?.type === 'prMerged'
      ? '#FFE9A8'
      : '#FFF4D8';
  const width = 236;
  const height = 28 + lines.length * 16;
  const tailX = 225;
  const x = 22;
  const y = 54;
  const shape = `M${x + 6} ${y} H${x + width - 6} V${y + 4} H${x + width} V${y + height - 6} H${x + width - 6} V${y + height} H${x + 28} L${tailX - 14} ${y + height + 12} L${tailX - 18} ${y + height} H${x + 6} V${y + height - 6} H${x + 2} V${y + 4} H${x + 6} Z`;
  return `<g class="speech-bubble">${pixelRoundRect(x + 3, y + 4, width, height, 4, '#06101B', 'opacity=".22"')}<path d="${shape}" fill="#152238" transform="translate(3 3)"/><path d="${shape}" fill="${fill}"/>${lines
    .map((line, index) => text(x + width / 2, y + 22 + index * 17, line, {
      size: 12,
      fill: '#142033',
      weight: 700,
      anchor: 'middle',
      letter: 0.5
    }))
    .join('')}</g>`;
}

function sidebar(data, pet, scene, now, timeZone) {
  const language = data.language;
  const lastCommit = data.latestCommit;
  const regenerated = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone
  }).format(now).toUpperCase();
  const rewardLine = pet.activeRewards.length
    ? `REWARDS · ${pet.activeRewards.join(' · ')}`
    : 'REWARDS · NONE YET — KEEP THE STREAK';

  const rows = [
    ['TODAY', compact(data.commitsToday), 'LAST 7 DAYS', compact(data.commits7d)],
    ['LIFETIME COMMITS', compact(data.totalCommits), 'CURRENT STREAK', `${data.currentStreak}d`],
    ['BEST STREAK', `${data.longestStreak}d`, 'DAYS OFF', data.daysSinceLastCommit == null ? '—' : `${data.daysSinceLastCommit}d`],
    ['PRS OPENED', compact(data.weekly.prsOpened), 'PRS MERGED', compact(data.weekly.prsMerged)],
    ['ISSUES CLOSED', compact(data.weekly.issuesClosed), 'REVIEWS', compact(data.weekly.reviews)],
    ['TOTAL STARS', compact(data.totalStars), 'FOLLOWERS', compact(data.followers)],
    ['MOST USED', language ? `${language.name} ${language.percent}%` : '—', 'LATEST COMMIT', lastCommit ? `${pet.latestClock} ${pet.latestTimeOfDay}` : '—']
  ];

  const grid = rows
    .map((row, index) => {
      const y = 160 + index * 38;
      const wide = index === 6;
      return `${statRow(652, y, row[0], row[1], {
        valueSize: wide ? 12 : 16,
        valueColor: index === 1 ? UI.gold : UI.cream
      })}${text(798, y + 11, row[2], {
        size: 8.5,
        fill: UI.faint,
        weight: 700,
        letter: 1.1
      })}${text(798, y + 27, row[3], {
        size: wide ? 11 : 16,
        fill: index === 5 ? '#8FD7E8' : UI.cream,
        weight: 700,
        letter: 0.1
      })}`;
    })
    .join('');

  return `<g>${rect(SIDEBAR_X, 0, WIDTH - SIDEBAR_X, HEIGHT, UI.panel)}${rect(SIDEBAR_X, 0, 1, HEIGHT, '#314868')}${rect(SIDEBAR_X + 1, 0, WIDTH - SIDEBAR_X - 1, HEIGHT, '#0C1626', 'opacity=".5"')}
    ${text(664, 31, 'PROFILE FAMILIAR', { size: 8.5, fill: UI.gold, weight: 700, letter: 2.2 })}
    ${text(664, 58, clampText(data.name, 20), { size: 21, fill: UI.cream, weight: 700, letter: 0.1 })}
    ${text(664, 76, clampText(`@${data.login} · joined ${formatShortDate(String(data.createdAt).slice(0, 10))}`, 46), {
      size: 9,
      fill: UI.muted,
      weight: 500,
      letter: 0.2
    })}
    ${stageMoodBar(pet.growth, pet.mood)}
    ${grid}
    ${rect(652, 440, 288, 1, UI.panelLine, 'opacity=".8"')}
    ${text(664, 453, rewardLine, {
      size: 7.6,
      fill: pet.activeRewards.length ? UI.gold : UI.faint,
      weight: 700,
      letter: 0.5
    })}
    ${text(664, 467, `UPDATED ${regenerated} · PUBLIC ACTIVITY`, {
      size: 7.3,
      fill: UI.faint,
      weight: 500,
      letter: 0.5
    })}
  </g>`;
}

function description(data, pet, scene) {
  return [
    `${data.name} (@${data.login}) has a ${pet.growth.title} named GitHub dragon.`,
    `Mood: ${pet.mood.label}.`,
    `${data.commitsToday} commits today, ${data.commits7d} in the last 7 days, ${data.totalCommits} lifetime commits.`,
    `${data.currentStreak}-day current streak, ${data.longestStreak}-day best streak.`,
    `${data.weekly.prsOpened} pull requests opened, ${data.weekly.prsMerged} merged, ${data.weekly.issuesClosed} issues closed, ${data.weekly.reviews} reviews this week.`,
    `${data.totalStars} stars, ${data.followers} followers.`,
    data.language ? `Most used language: ${data.language.name}.` : '',
    data.latestCommit
      ? `Latest commit at ${pet.latestClock} (${pet.latestTimeOfDay}).`
      : 'No public commit found.',
    `Hunger ${pet.hunger}%. Scene: ${scene.label}.`,
    `Updated ${formatShortDate(String(data.generatedAt || new Date().toISOString()).slice(0, 10))}.`
  ]
    .filter(Boolean)
    .join(' ');
}

export function renderCard({ data, pet, now, timeZone }) {
  const scene = sceneForNow(now, timeZone, data.latestCommit);
  const sceneWidth = SCENE_WIDTH;
  const p = scenePalette(scene);
  const geo = dragonAnchors(pet);
  const dragon = renderDragon({
    pet,
    data,
    geo,
    scene: {
      ...scene,
      width: sceneWidth,
      groundY: GROUND_Y,
      dragonX: Math.round(sceneWidth * 0.5)
    },
    palette: ctxPalette(pet),
    languageColor: data.language?.color
  });
  const title = `${data.name}'s GitHub dragon — ${pet.growth.title}, ${pet.mood.label}`;
  const desc = description(data, pet, scene);
  const lastCommit = data.latestCommit;
  const bubble = speech(pet);

  const defs = `<defs>
    <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="1" stop-color="${p.skyBottom}"/>
    </linearGradient>
    <linearGradient id="sidebarFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#122036"/>
      <stop offset="1" stop-color="#0A1320"/>
    </linearGradient>
    <clipPath id="cardClip"><rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="24"/></clipPath>
    <clipPath id="sceneClip"><path d="M24 0 H${SCENE_WIDTH} V${HEIGHT} H0 V24 A24 24 0 0 1 24 0 Z"/></clipPath>
  </defs>`;

  const frame = `<rect x=".75" y=".75" width="${WIDTH - 1.5}" height="${HEIGHT - 1.5}" rx="23.5" fill="none" stroke="#233A57" stroke-width="1.5" class="frame"/>`;

  const styles = `<style>
    .dragon-motion, .wing-flap, .tail-wag, .egg-wobble, .aura, .gem-float,
    .flame, .steam, .zzz, .smoke, .sparkle, .heart-float, .coin, .flag-wave,
    .cloud, .star, .firefly, .wave, .dust, .confetti, .eye-blink, .heart-eyes,
    .shoulder-flame, .speed-lines, .rumble {
      transform-box: fill-box;
    }
    .dragon-motion { transform-box: fill-box; transform-origin: 50% 100%; }
    .mood-happy .dragon-motion { animation: happy-bob 2.6s ease-in-out infinite; }
    .mood-hyper .dragon-motion { animation: fly-loop 3.4s ease-in-out infinite; }
    .mood-sleepy .dragon-motion, .mood-asleep .dragon-motion { animation: breathe 4.4s ease-in-out infinite; }
    .mood-onFire .dragon-motion { animation: fire-bounce .9s steps(2,end) infinite; }
    .mood-sulking .dragon-motion { animation: sulk 3.4s ease-in-out infinite; }
    .mood-hungry .dragon-motion { animation: hungry-shake .55s steps(2,end) infinite; }
    .wing-flap { transform-origin: 100% 100%; animation: wing-flap 1.9s ease-in-out infinite; }
    .wing-flap-fast { animation-duration: .58s; }
    .wing-slow { animation-duration: 3.4s; }
    .wing-droop { animation: wing-droop 3.8s ease-in-out infinite; }
    .wing-front { animation-delay: -.42s; }
    .tail-wag { transform-origin: 100% 50%; animation: tail-wag 2.2s ease-in-out infinite; }
    .tail-wag-fast { animation-duration: .65s; }
    .tail-wag-slow { animation-duration: 4.5s; }
    .tail-droop { animation: tail-droop 4s ease-in-out infinite; }
    .eye-blink { transform-origin: 50% 50%; animation: blink 5.3s steps(1,end) infinite; }
    .heart-eyes { transform-origin: 50% 50%; animation: heart-pulse 1.1s ease-in-out infinite; }
    .heart-float { animation: heart-float 2.8s ease-out infinite; opacity: 0; }
    .zzz { animation: zzz-float 3.2s ease-out infinite; opacity: 0; }
    .zzz-two { animation-delay: -1s; }
    .zzz-three { animation-delay: -2s; }
    .sparkle { animation: twinkle 1.8s steps(2,end) infinite; transform-origin: 50% 50%; }
    .smoke { animation: smoke-rise 2.7s ease-out infinite; opacity: 0; }
    .steam { animation: steam-rise 2s ease-out infinite; opacity: 0; }
    .flame { transform-origin: 50% 100%; animation: flicker .34s steps(2,end) infinite alternate; }
    .flame-wing { animation-duration: .28s; }
    .flame-huge { animation-duration: .2s; }
    .flame-ember { animation-duration: .9s; }
    .shoulder-flame { transform-origin: 50% 100%; animation: flicker .4s steps(2,end) infinite alternate; }
    .aura { transform-origin: 50% 50%; animation: aura-pulse 2.7s ease-in-out infinite; }
    .gem-float { animation: gem-float 3s ease-in-out infinite; }
    .coin { transform-origin: 50% 50%; animation: coin-spin 2.4s steps(5,end) infinite; }
    .flag-wave { transform-origin: 0 50%; animation: flag-wave 1.4s ease-in-out infinite; }
    .cloud { animation: cloud-drift 24s linear infinite; }
    .cloud-b { animation-duration: 31s; animation-direction: reverse; }
    .cloud-c { animation-duration: 38s; }
    .star { animation: twinkle 2.9s ease-in-out infinite; }
    .firefly { animation: firefly 4.6s ease-in-out infinite; }
    .wave { animation: wave 4s ease-in-out infinite; transform-origin: 50% 50%; }
    .dust { animation: dust-float 6.4s ease-in-out infinite; }
    .confetti { animation: confetti-fall 3.2s linear infinite; opacity: 0; }
    .speed-lines { animation: speed-fade 1.2s ease-in-out infinite; }
    .rumble { animation: rumble .45s steps(2,end) infinite; }
    .rumble-fast { animation-duration: .22s; }
    .roar-lines { animation: speed-fade .8s ease-in-out infinite; }
    .egg-wobble { transform-origin: 50% 100%; animation: egg-wobble 2.4s ease-in-out infinite; }
    .egg-wobble-hard { animation: egg-wobble-hard .7s steps(2,end) infinite; }
    .egg-sleep { transform-origin: 50% 100%; animation: breathe 4.4s ease-in-out infinite; }
    .hunger-bar { animation: hunger-in 1s ease-out both; }
    .speech-bubble { animation: bubble-in .7s ease-out both; }
    @keyframes happy-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.6px); } }
    @keyframes fly-loop {
      0%,100% { transform: translate(0,0) rotate(0); }
      25% { transform: translate(-11px,-8px) rotate(-4deg); }
      50% { transform: translate(2px,-14px) rotate(0); }
      75% { transform: translate(11px,-7px) rotate(4deg); }
    }
    @keyframes breathe { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(.8px) scale(1.012); } }
    @keyframes fire-bounce { 0%,100% { transform: translateY(-1px); } 50% { transform: translateY(1px); } }
    @keyframes sulk { 0%,100% { transform: translateY(0); } 50% { transform: translateY(.8px); } }
    @keyframes hungry-shake { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-.8px); } }
    @keyframes wing-flap { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-9deg); } }
    @keyframes wing-droop { 0%,100% { transform: rotate(21deg); } 50% { transform: rotate(16deg); } }
    @keyframes tail-wag { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-7deg); } }
    @keyframes tail-droop { 0%,100% { transform: rotate(10deg); } 50% { transform: rotate(15deg); } }
    @keyframes blink { 0%,91%,100% { transform: scaleY(1); } 94%,97% { transform: scaleY(.12); } }
    @keyframes heart-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
    @keyframes heart-float { 0% { opacity: 0; transform: translateY(7px) scale(.8); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(-16px) scale(1.12); } }
    @keyframes zzz-float { 0% { opacity: 0; transform: translate(0,8px) scale(.7); } 20% { opacity: .95; } 100% { opacity: 0; transform: translate(7px,-18px) scale(1.12); } }
    @keyframes twinkle { 0%,100% { opacity: .25; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.08); } }
    @keyframes smoke-rise { 0% { opacity: 0; transform: translate(0,5px) scale(.75); } 25% { opacity: .8; } 100% { opacity: 0; transform: translate(6px,-18px) scale(1.2); } }
    @keyframes steam-rise { 0% { opacity: 0; transform: translate(0,4px); } 25% { opacity: .55; } 100% { opacity: 0; transform: translate(4px,-18px); } }
    @keyframes flicker { 0% { transform: scaleY(.9) scaleX(1.04) rotate(-1deg); opacity: .88; } 100% { transform: scaleY(1.06) scaleX(.94) rotate(1deg); opacity: 1; } }
    @keyframes aura-pulse { 0%,100% { opacity: .55; transform: scale(.97); } 50% { opacity: .92; transform: scale(1.03); } }
    @keyframes gem-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes coin-spin { 0% { transform: scaleX(1); } 50% { transform: scaleX(.28); } 100% { transform: scaleX(1); } }
    @keyframes flag-wave { 0%,100% { transform: skewY(0deg) scaleX(1); } 50% { transform: skewY(-4deg) scaleX(.94); } }
    @keyframes cloud-drift { 0% { transform: translateX(0); } 50% { transform: translateX(14px); } 100% { transform: translateX(0); } }
    @keyframes firefly { 0%,100% { opacity: .25; transform: translate(0,0); } 50% { opacity: .9; transform: translate(4px,-6px); } }
    @keyframes wave { 0%,100% { transform: scaleX(1); opacity: .5; } 50% { transform: scaleX(1.18); opacity: .8; } }
    @keyframes dust-float { 0%,100% { opacity: .25; transform: translate(0,0); } 50% { opacity: .8; transform: translate(-4px,-5px); } }
    @keyframes confetti-fall {
      0% { opacity: 0; transform: translateY(-14px) rotate(0); }
      10% { opacity: 1; }
      100% { opacity: 0; transform: translateY(260px) rotate(240deg); }
    }
    @keyframes speed-fade { 0%,100% { opacity: .25; } 50% { opacity: .85; } }
    @keyframes rumble { 0%,100% { transform: translateX(0); } 50% { transform: translateX(1.5px); } }
    @keyframes egg-wobble { 0%,100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
    @keyframes egg-wobble-hard { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
    @keyframes hunger-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bubble-in { from { opacity: 0; transform: translateY(5px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @media (prefers-color-scheme: dark) { .frame { stroke: #6E84A7; } }
    @media (prefers-reduced-motion: reduce) {
      .dragon-motion, .wing-flap, .tail-wag, .egg-wobble, .aura, .gem-float,
      .flame, .steam, .zzz, .smoke, .sparkle, .heart-float, .coin, .flag-wave,
      .cloud, .star, .firefly, .wave, .dust, .confetti, .eye-blink, .heart-eyes,
      .shoulder-flame, .speed-lines, .rumble, .hunger-bar, .speech-bubble {
        animation: none !important;
      }
    }
  </style>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="petTitle petDesc" data-generator="profile-dragon">
  <title id="petTitle">${esc(title)}</title>
  <desc id="petDesc">${esc(desc)}</desc>
  ${defs}
  ${styles}
  <g clip-path="url(#cardClip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#0A1320"/>
    ${renderBackdrop({
      scene: { ...scene, dragonX: SCENE_WIDTH * 0.5 },
      pet,
      width: SCENE_WIDTH,
      height: HEIGHT,
      groundY: GROUND_Y
    })}
    ${sceneBadges(scene, pet, p, now, timeZone)}
    ${dragon.markup}
    ${pet.accessories.confetti ? confetti() : ''}
    ${bubble}
    ${hungerBar({
      x: 222,
      y: 424,
      width: 218,
      value: pet.hunger,
      label: pet.hungerLabel
    })}
    ${sidebar(data, pet, scene, now, timeZone)}
    ${frame}
  </g>
</svg>\n`;
}

function ctxPalette(pet) {
  return STAGE_PALETTES[pet.growth.id];
}
