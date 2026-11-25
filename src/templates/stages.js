import { STAGE_PALETTES, REWARD_COLORS } from './palette.js';
import {
  rect,
  pixelBlob,
  outlinedBlob,
  pixelRoundRect,
  pixelLine,
  pixelCircle,
  pixelEllipse,
  pixelDiamond,
  pixelPolygon,
  scalePoints,
  flame,
  group
} from './primitives.js';
import { drawFace, drawMoodEffects } from './moods.js';
import { drawAccessories, drawCompanion } from './accessories.js';

const BODY = {
  hatchling: {
    bodyTop: -28,
    rows: [7, 9, 11, 12, 13, 14, 14, 14, 13, 12, 11, 9, 7, 5],
    head: { x: 2, y: -64, w: 28, h: 22 },
    eye: { x: 20, y: -59, w: 8, h: 9 },
    snout: { x: 27, y: -50, w: 13, h: 9 },
    neck: { x: 9, y: -43, w: 15, h: 17 },
    paw: { x: 23, y: -10 },
    tail: { x: -12, y: -13, scale: 0.58 },
    wing: { x: -3, y: -27, scale: 0.46 },
    frontWing: { x: 8, y: -27, scale: 0.30 },
    headTop: -64,
    headCenterX: 16,
    top: -68,
    horn: 0.55,
    legs: { y: -7, left: -12, right: 5, w: 8 },
    belly: { x: 3, y: -21, w: 11, h: 15 },
    mouth: { x: 31, y: -45 },
    nostril: { x: 37, y: -47 },
    scale: 1
  },
  young: {
    bodyTop: -33,
    rows: [8, 11, 14, 16, 18, 19, 20, 20, 20, 19, 18, 17, 15, 13, 11, 9, 7],
    head: { x: 7, y: -68, w: 26, h: 21 },
    eye: { x: 23, y: -63, w: 6, h: 7 },
    snout: { x: 29, y: -55, w: 13, h: 8 },
    neck: { x: 13, y: -48, w: 15, h: 17 },
    paw: { x: 27, y: -11 },
    tail: { x: -17, y: -15, scale: 0.78 },
    wing: { x: -5, y: -31, scale: 0.72 },
    frontWing: { x: 9, y: -31, scale: 0.46 },
    headTop: -68,
    headCenterX: 20,
    top: -72,
    horn: 0.75,
    legs: { y: -8, left: -16, right: 5, w: 9 },
    belly: { x: 4, y: -26, w: 14, h: 19 },
    mouth: { x: 35, y: -49 },
    nostril: { x: 40, y: -51 },
    scale: 1
  },
  adult: {
    bodyTop: -38,
    rows: [8, 12, 15, 18, 20, 22, 23, 24, 24, 24, 23, 22, 21, 19, 17, 15, 13, 11, 8],
    head: { x: 8, y: -76, w: 30, h: 24 },
    eye: { x: 28, y: -70, w: 6, h: 8 },
    snout: { x: 36, y: -61, w: 14, h: 9 },
    neck: { x: 13, y: -53, w: 17, h: 17 },
    paw: { x: 32, y: -12 },
    tail: { x: -20, y: -17, scale: 0.94 },
    wing: { x: -6, y: -36, scale: 1 },
    frontWing: { x: 10, y: -36, scale: 0.62 },
    headTop: -76,
    headCenterX: 23,
    top: -84,
    horn: 1,
    legs: { y: -9, left: -19, right: 7, w: 10 },
    belly: { x: 5, y: -31, w: 16, h: 23 },
    mouth: { x: 43, y: -55 },
    nostril: { x: 47, y: -57 },
    scale: 1
  },
  elder: {
    bodyTop: -40,
    rows: [8, 12, 16, 19, 22, 24, 25, 26, 26, 26, 26, 25, 24, 23, 21, 19, 17, 14, 11, 8],
    head: { x: 8, y: -80, w: 32, h: 26 },
    eye: { x: 29, y: -73, w: 6, h: 8 },
    snout: { x: 38, y: -64, w: 14, h: 10 },
    neck: { x: 13, y: -55, w: 18, h: 17 },
    paw: { x: 34, y: -12 },
    tail: { x: -21, y: -18, scale: 1.02 },
    wing: { x: -6, y: -38, scale: 1.12 },
    frontWing: { x: 11, y: -38, scale: 0.68 },
    headTop: -80,
    headCenterX: 24,
    top: -90,
    horn: 1.25,
    legs: { y: -9, left: -20, right: 8, w: 10 },
    belly: { x: 5, y: -33, w: 17, h: 24 },
    mouth: { x: 45, y: -58 },
    nostril: { x: 49, y: -60 },
    scale: 1.04
  }
};

export const GEOMETRY = {
  egg: {
    bodyTop: -40,
    top: -42,
    headTop: -38,
    headCenterX: 0,
    eye: { x: -5, y: -25, w: 10, h: 6 },
    snout: { x: 8, y: -26, w: 7, h: 5 },
    neck: { x: -9, y: -21, w: 18, h: 9 },
    paw: { x: 14, y: -6 },
    mouth: { x: 8, y: -22 },
    nostril: { x: 12, y: -24 },
    tail: { x: -14, y: -8, scale: 0.4 },
    wing: { x: -12, y: -20, scale: 0.34 },
    frontWing: { x: 12, y: -20, scale: 0.26 },
    legs: { y: -3, left: -8, right: 4, w: 6 },
    belly: { x: -11, y: -32, w: 22, h: 26 },
    scale: 1
  },
  ...Object.fromEntries(
    Object.entries(BODY).map(([key, value]) => [key, { ...value, ...value, type: 'dragon' }])
  )
};

const WING_SHAPE = [
  [0, 0],
  [-7, -14],
  [-15, -27],
  [-30, -20],
  [-23, -14],
  [-27, -6],
  [-18, -3],
  [-20, 3],
  [-9, 2],
  [-2, 5]
];

function wingMarkup(scale, palette, flameWings) {
  const shape = WING_SHAPE.map(([x, y]) => [x * scale, y * scale]);
  const xs = shape.map(([x]) => x);
  const ys = shape.map(([, y]) => y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const outline = pixelPolygon(scalePoints(shape, 1.16, cx, cy), palette.outline, 2);
  const membrane = pixelPolygon(shape, flameWings ? REWARD_COLORS.flameWing : palette.wing, 2);
  const boneColor = flameWings ? '#FFE08A' : palette.wingBone;
  const bones = [
    pixelLine(0, -1, -15 * scale, -27 * scale, 1.6, boneColor, 'opacity=".9"'),
    pixelLine(0, -1, -30 * scale, -20 * scale, 1.4, boneColor, 'opacity=".85"'),
    pixelLine(0, -1, -27 * scale, -6 * scale, 1.2, boneColor, 'opacity=".8"'),
    pixelLine(0, -1, -20 * scale, 3 * scale, 1.2, boneColor, 'opacity=".7"')
  ].join('');
  const flames = flameWings
    ? [
        flame(-28 * scale, -19 * scale, 8 * scale, 15 * scale, {
          outer: REWARD_COLORS.flameWing,
          inner: '#FFB347',
          core: '#FFF4B0',
          glow: '#FFB347'
        }, { className: 'flame flame-wing', style: 'animation-delay:-.12s' }),
        flame(-25 * scale, -5 * scale, 6 * scale, 12 * scale, {
          outer: REWARD_COLORS.flameWing,
          inner: '#FFC857',
          core: '#FFF4B0',
          glow: '#FFB347'
        }, { className: 'flame flame-wing', style: 'animation-delay:-.28s' })
      ].join('')
    : '';
  return { outline, membrane, bones, flames };
}

function drawWing(ctx, side) {
  const { geo, palette, pet } = ctx;
  const config = side === 'back' ? geo.wing : geo.frontWing;
  const scale = config.scale;
  const flameWings = side === 'back' && pet.accessories.flameWings;
  const wing = wingMarkup(1, palette, flameWings);
  const mirror = side === 'front' ? -1 : 1;
  const x = config.x;
  const y = config.y;
  const mood = pet.mood.id;
  let wingClass = 'wing-flap';
  if (mood === 'hyper' || mood === 'onFire') wingClass = 'wing-flap wing-flap-fast';
  if (mood === 'sulking' || mood === 'asleep' || pet.accessories.droopyWings) wingClass = 'wing-flap wing-droop';
  if (mood === 'sleepy') wingClass = 'wing-flap wing-slow';
  if (side === 'front') wingClass += ' wing-front';
  const transform = `translate(${x} ${y}) scale(${mirror * scale} ${scale})`;
  return `<g transform="${transform}"><g class="${wingClass}"${side === 'front' ? ' style="animation-delay:-.38s"' : ''}>${wing.outline}${wing.membrane}${wing.bones}${wing.flames}</g></g>`;
}

function drawTail(ctx) {
  const { geo, palette, pet } = ctx;
  const tail = geo.tail;
  const s = tail.scale;
  const outline = [
    rect(-11 * s, -8 * s, 13 * s, 11 * s, palette.outline),
    rect(-22 * s, -10 * s, 13 * s, 11 * s, palette.outline),
    rect(-32 * s, -9 * s, 13 * s, 10 * s, palette.outline),
    rect(-41 * s, -5 * s, 12 * s, 9 * s, palette.outline),
    rect(-48 * s, -1 * s, 10 * s, 8 * s, palette.outline),
    rect(-55 * s, -7 * s, 11 * s, 12 * s, palette.outline)
  ].join('');
  const fill = [
    rect(-11 * s, -6.5 * s, 12 * s, 8 * s, palette.bodyShade),
    rect(-22 * s, -8.5 * s, 12 * s, 8 * s, palette.bodyShade),
    rect(-32 * s, -7.5 * s, 12 * s, 8 * s, palette.bodyShade),
    rect(-40 * s, -3.5 * s, 11 * s, 6 * s, palette.bodyShade),
    rect(-47 * s, 0, 9 * s, 5 * s, palette.bodyShade),
    rect(-54 * s, -5 * s, 8 * s, 8 * s, palette.spike)
  ].join('');
  const shine = rect(-36 * s, -5 * s, 7 * s, 2 * s, palette.bodyLight, 'opacity=".55"');
  const mood = pet.mood.id;
  const tailClass =
    mood === 'happy' || mood === 'hyper'
      ? 'tail-wag tail-wag-fast'
      : mood === 'sleepy' || mood === 'asleep'
        ? 'tail-wag tail-wag-slow'
        : mood === 'sulking'
          ? 'tail-wag tail-droop'
          : 'tail-wag';
  return `<g transform="translate(${tail.x} ${tail.y})"><g class="${tailClass}">${outline}${fill}${shine}</g></g>`;
}

function drawTailCurl(ctx) {
  const { palette } = ctx;
  const outline = [
    rect(-28, -4, 54, 7, palette.outline),
    rect(20, -12, 10, 10, palette.outline),
    rect(14, -20, 12, 10, palette.outline),
    rect(4, -26, 12, 10, palette.outline),
    rect(-8, -29, 12, 10, palette.outline),
    rect(-20, -26, 12, 8, palette.outline)
  ].join('');
  const fill = [
    rect(-27, -2.5, 52, 4, palette.bodyShade),
    rect(21, -10, 8, 7, palette.bodyShade),
    rect(15, -18, 9, 7, palette.bodyShade),
    rect(5, -24, 9, 7, palette.bodyShade),
    rect(-7, -27, 10, 7, palette.bodyShade),
    rect(-19, -24, 10, 5, palette.spike)
  ].join('');
  return `<g class="tail-curl">${outline}${fill}</g>`;
}

function drawBody(ctx) {
  const { geo, palette, pet } = ctx;
  const body = pixelBlob(geo.rows, 0, geo.bodyTop, palette.body, 2);
  const outline = outlinedBlob(geo.rows, 0, geo.bodyTop, palette.outline, palette.body, 2, 1);
  const shade = [
    rect(-geo.rows[6], geo.bodyTop + 12, 3, 10, palette.bodyShade, 'opacity=".75"'),
    rect(-geo.rows[8], geo.bodyTop + 20, 3, 8, palette.bodyShade, 'opacity=".65"'),
    rect(-geo.rows[10], geo.bodyTop + 28, 2, 6, palette.bodyShade, 'opacity=".55"')
  ].join('');
  const belly = pixelRoundRect(
    geo.belly.x,
    geo.belly.y,
    geo.belly.w,
    geo.belly.h,
    2,
    palette.belly
  );
  const stripes = Array.from({ length: 4 }, (_, index) =>
    rect(geo.belly.x + 2, geo.belly.y + 5 + index * 5, geo.belly.w - 4, 1.5, palette.bellyShade, 'opacity=".55"')
  ).join('');
  const highlight = [
    rect(-geo.rows[4] + 2, geo.bodyTop + 7, 5, 2, palette.bodyLight, 'opacity=".65"'),
    rect(-geo.rows[6] + 2, geo.bodyTop + 12, 4, 2, palette.bodyLight, 'opacity=".45"')
  ].join('');
  const spikes = [0, 1, 2, 3].map((index) => {
    const y = geo.bodyTop + 5 + index * 7;
    const x = -geo.rows[Math.min(index + 2, geo.rows.length - 1)] + 3;
    return [
      rect(x - 5, y, 6, 3, palette.spike),
      rect(x - 3, y - 3, 4, 3, palette.spike),
      rect(x - 1, y - 6, 2, 3, palette.spike)
    ].join('');
  }).join('');
  const legWidth = geo.legs.w;
  const legY = geo.legs.y;
  const leg = (x) =>
    [
      pixelRoundRect(x, legY, legWidth, -legY + 1, 1, palette.outline),
      pixelRoundRect(x + 1, legY + 1, legWidth - 2, -legY - 1, 1, palette.bodyShade),
      rect(x + 1, -2, 3, 3, palette.horn),
      rect(x + legWidth - 3, -2, 3, 3, palette.horn)
    ].join('');
  const arm = [
    pixelRoundRect(geo.belly.x + geo.belly.w - 7, geo.bodyTop + 20, 8, 12, 2, palette.outline),
    pixelRoundRect(geo.belly.x + geo.belly.w - 6, geo.bodyTop + 21, 6, 10, 1, palette.body),
    rect(geo.belly.x + geo.belly.w - 4, geo.bodyTop + 30, 3, 3, palette.horn)
  ].join('');
  return `${outline}${body}${shade}${highlight}${belly}${stripes}${spikes}${leg(geo.legs.left)}${leg(geo.legs.right)}${arm}`;
}

function drawHead(ctx) {
  const { geo, palette, pet } = ctx;
  const head = geo.head;
  const neck = geo.neck;
  const outline = pixelRoundRect(neck.x - 1, neck.y - 1, neck.w + 2, neck.h + 3, 2, palette.outline);
  const neckFill = pixelRoundRect(neck.x, neck.y, neck.w, neck.h + 1, 2, palette.body);
  const headOutline = pixelRoundRect(head.x - 1, head.y - 1, head.w + 2, head.h + 3, 4, palette.outline);
  const headFill = pixelRoundRect(head.x, head.y, head.w, head.h, 3, palette.body);
  const jaw = pixelRoundRect(head.x + 12, head.y + head.h - 7, head.w - 9, 8, 2, palette.bodyShade);
  const snout = [
    pixelRoundRect(geo.snout.x - 1, geo.snout.y - 1, geo.snout.w + 2, geo.snout.h + 2, 2, palette.outline),
    pixelRoundRect(geo.snout.x, geo.snout.y, geo.snout.w, geo.snout.h, 2, palette.bodyLight)
  ].join('');
  const headShine = rect(head.x + 4, head.y + 3, 8, 3, palette.bodyLight, 'opacity=".7"');
  const ear = [
    rect(head.x - 5, head.y + 6, 5, 8, palette.outline),
    rect(head.x - 4, head.y + 7, 4, 5, palette.spike),
    rect(head.x - 2, head.y + 13, 3, 4, palette.spike)
  ].join('');
  const hornScale = geo.horn || 1;
  const horns = [
    rect(head.x + 5, head.y - 6 * hornScale, 4, 8 * hornScale, palette.outline),
    rect(head.x + 6, head.y - 9 * hornScale, 3, 6 * hornScale, palette.horn),
    rect(head.x + head.w - 10, head.y - 7 * hornScale, 4, 8 * hornScale, palette.outline),
    rect(head.x + head.w - 9, head.y - 10 * hornScale, 3, 6 * hornScale, palette.horn)
  ].join('');
  const scales = [
    rect(head.x + head.w - 9, head.y + 6, 3, 2, palette.bodyShade, 'opacity=".55"'),
    rect(head.x + head.w - 13, head.y + 10, 3, 2, palette.bodyShade, 'opacity=".45"')
  ].join('');
  const backTurned = pet.mood.id === 'sulking';
  const backPlate = backTurned
    ? [
        rect(head.x + 4, head.y + 5, 6, 2, palette.bodyShade),
        rect(head.x + 9, head.y + 9, 7, 2, palette.bodyShade),
        rect(head.x + 13, head.y + 14, 5, 2, palette.bodyShade),
        rect(head.x + 9, head.y + 2, 4, 3, palette.spike)
      ].join('')
    : '';
  return `${neckFill}${headOutline}${horns}${ear}${headFill}${jaw}${snout}${headShine}${scales}${backPlate}`;
}

function drawEgg(ctx) {
  const { geo, palette, pet } = ctx;
  const rows = [3, 6, 9, 12, 14, 15, 15, 15, 14, 13, 11, 9, 7, 5, 3];
  const top = -40;
  const spots = [
    [5, -31, 4, 4],
    [-8, -24, 3, 3],
    [2, -16, 4, 3],
    [-4, -35, 2, 2]
  ];
  const spotColors = spots.map((spot) => rect(...spot, palette.spot)).join('');
  const nest = [
    rect(-21, -3, 42, 5, palette.nest),
    rect(-17, -6, 9, 4, palette.nestLight),
    rect(-4, -7, 12, 4, palette.nestLight),
    rect(9, -6, 9, 4, palette.nestLight),
    rect(-25, 0, 9, 3, palette.nest),
    rect(17, -1, 8, 3, palette.nest),
    rect(-14, 2, 28, 2, palette.outline)
  ].join('');
  const nestFront = [
    rect(-19, -11, 38, 3, palette.nest),
    rect(-13, -13, 9, 3, palette.nestLight),
    rect(4, -12, 12, 3, palette.nestLight),
    rect(-22, -10, 5, 2, palette.nest),
    rect(16, -10, 6, 2, palette.nestLight)
  ].join('');
  const outline = outlinedBlob(rows, 0, top, palette.outline, palette.shell, 2, 1);
  const shade = [
    rect(-14, -24, 3, 16, palette.shellShade, 'opacity=".55"'),
    rect(-11, -30, 2, 8, palette.shellShade, 'opacity=".4"'),
    rect(-4, -6, 16, 3, palette.shellShade, 'opacity=".55"')
  ].join('');
  const shine = [
    rect(-9, -33, 4, 6, palette.shellLight),
    rect(-5, -36, 5, 2, palette.shellLight)
  ].join('');
  const crackLevel = pet.growth.eggCrack;
  let cracks = '';
  if (crackLevel > 0.32) {
    cracks += [
      rect(4, -39, 2, 4, palette.crack),
      rect(6, -35, 2, 3, palette.crack),
      rect(3, -32, 4, 2, palette.crack)
    ].join('');
  }
  if (crackLevel > 0.62) {
    cracks += [
      rect(7, -31, 2, 4, palette.crack),
      rect(9, -27, 2, 4, palette.crack),
      rect(2, -29, 4, 2, palette.crack),
      rect(-1, -27, 3, 2, palette.crack)
    ].join('');
  }
  if (crackLevel > 0.84) {
    cracks += [
      rect(-2, -26, 2, 5, palette.crack),
      rect(11, -23, 3, 3, palette.crack),
      rect(6, -20, 4, 2, palette.crack),
      rect(8, -36, 3, 2, palette.crack)
    ].join('');
  }
  const wobbleClass =
    pet.mood.id === 'asleep'
      ? 'egg-sleep'
      : crackLevel > 0.84
        ? 'egg-wobble egg-wobble-hard'
        : 'egg-wobble';
  return `<g class="${wobbleClass}">${nest}${outline}${spotColors}${shade}${shine}${cracks}${nestFront}</g>`;
}

function drawAura(ctx) {
  if (!ctx.pet.accessories.goldenAura) return '';
  const { palette } = ctx;
  const cy = -36;
  const rings = [
    pixelEllipse(0, cy, 45, 31, '#FFD86B', 3, 'opacity=".08"'),
    pixelEllipse(0, cy, 39, 27, '#FFE7A0', 3, 'opacity=".07"')
  ].join('');
  const gems =
    ctx.pet.growth.id === 'elder'
      ? [
          `<g class="gem-float" style="animation-delay:-.4s">${pixelDiamond(-34, -64, 4, '#8DE8FF')}${rect(-36, -70, 4, 2, '#FFFDF5', 'opacity=".7"')}</g>`,
          `<g class="gem-float" style="animation-delay:-1.1s">${pixelDiamond(36, -50, 3, '#F2A6FF')}${rect(34, -55, 3, 2, '#FFFDF5', 'opacity=".7"')}</g>`,
          `<g class="gem-float" style="animation-delay:-1.8s">${pixelDiamond(25, -74, 3, '#9CFFD5')}${rect(23, -79, 3, 2, '#FFFDF5', 'opacity=".7"')}</g>`
        ].join('')
      : '';
  return `<g class="aura">${rings}${gems}</g>`;
}

function drawEggAura(ctx) {
  if (!ctx.pet.accessories.goldenAura) return '';
  return `<g class="aura">${pixelEllipse(0, -22, 33, 30, '#FFD86B', 3, 'opacity=".10"')}${pixelEllipse(0, -22, 27, 25, '#FFE7A0', 3, 'opacity=".08"')}</g>`;
}

function drawEggWings(ctx) {
  if (!ctx.pet.accessories.flameWings) return '';
  return [
    `<g transform="translate(-14 -21) scale(.32 .32)"><g class="flame flame-wing">${flame(0, 0, 18, 28, {
      outer: REWARD_COLORS.flameWing,
      inner: '#FFB347',
      core: '#FFF4B0',
      glow: '#FFB347'
    })}</g></g>`,
    `<g transform="translate(14 -21) scale(-.32 .32)"><g class="flame flame-wing">${flame(0, 0, 18, 28, {
      outer: REWARD_COLORS.flameWing,
      inner: '#FFB347',
      core: '#FFF4B0',
      glow: '#FFB347'
    })}</g></g>`
  ].join('');
}

function drawBreath(ctx) {
  const { geo, pet, palette } = ctx;
  const mood = pet.mood.id;
  if (mood === 'asleep' || mood === 'sleepy') {
    return drawSmoke(geo, '#A9B8C8', 2);
  }
  if (mood === 'sulking') {
    return [
      `<g transform="translate(${geo.snout.x + geo.snout.w + 2} ${geo.snout.y + 3}) rotate(90)">${flame(0, 0, 5, 6, {
        outer: '#B56A3B',
        inner: '#F2A33B',
        core: '#FFE1A1',
        glow: '#F2A33B'
      }, { className: 'flame flame-ember' })}</g>`,
      drawSmoke(geo, '#8794A5', 2)
    ].join('');
  }

  let size = 0;
  let width = 9;
  let height = 11;
  let cls = 'flame flame-puff';
  if (mood === 'happy') size = 1;
  if (mood === 'peckish') size = 0.7;
  if (mood === 'hungry' || pet.accessories.roar) {
    size = 2.6;
    width = 15;
    height = 18;
    cls = 'flame flame-roar';
  }
  if (mood === 'hyper') {
    size = 1.4;
    width = 11;
    height = 14;
    cls = 'flame flame-puff';
  }
  if (mood === 'onFire') {
    size = 2.7;
    width = 17;
    height = 22;
    cls = 'flame flame-huge';
  }
  if (pet.growth.id === 'young' && size < 1) size = 1;
  if (pet.growth.id === 'adult' && size < 1.4) size = 1.4;
  if (pet.growth.id === 'elder' && size < 1.8) size = 1.8;

  if (size === 0) return '';
  const glow = `<ellipse cx="${geo.snout.x + geo.snout.w + 12}" cy="${geo.snout.y + 4}" rx="${16 * size}" ry="${9 * size}" fill="#FF9B3D" opacity=".14"/>`;
  const colors = pet.growth.id === 'elder'
    ? { outer: '#FF8A3D', inner: '#FFD35C', core: '#FFF8D8', glow: '#FFD35C' }
    : { outer: palette.flame, inner: '#FFD35C', core: '#FFF8D8', glow: palette.flame };
  return `${glow}<g transform="translate(${geo.snout.x + geo.snout.w + 2} ${geo.snout.y + 4}) rotate(90)">${flame(0, 0, width * size, height * size, colors, {
    className: cls,
    glow: true
  })}</g>`;
}

function drawSmoke(geo, color, count = 3) {
  let out = '';
  for (let index = 0; index < count; index += 1) {
    const x = geo.nostril.x + 3 + index * 4;
    const y = geo.nostril.y - 4 - index * 3;
    out += `<g class="smoke" style="animation-delay:${-0.65 * index}s">${pixelCircle(x, y, 2.4 + index * 0.7, color, 1, 'opacity=".38"')}${pixelCircle(x + 3, y - 2, 1.7, color, 1, 'opacity=".25"')}</g>`;
  }
  return out;
}

function drawShinyScales(ctx) {
  if (!ctx.pet.accessories.shinyScales) return '';
  const { geo } = ctx;
  return [
    `<g class="sparkle" style="animation-delay:-.2s">${rect(-geo.rows[5], geo.bodyTop + 8, 2, 2, '#FFF1A0')}</g>`,
    `<g class="sparkle" style="animation-delay:-.9s">${rect(geo.belly.x + 4, geo.belly.y + 6, 2, 2, '#FFF8D0')}</g>`,
    `<g class="sparkle" style="animation-delay:-1.5s">${rect(-geo.rows[8], geo.bodyTop + 17, 2, 2, '#FFE68A')}</g>`
  ].join('');
}

function dragonTransform(pet, scene) {
  const stageScale = pet.growth.id === 'elder' ? 1.02 : 1;
  let x = scene.dragonX;
  let y = scene.groundY;
  let scale = stageScale;
  let rotate = 0;
  let mirror = false;

  if (pet.mood.id === 'asleep') {
    x = scene.width - 132;
    y = scene.groundY + 5;
    scale = stageScale * 0.72;
    rotate = 10;
  } else if (pet.mood.id === 'sleepy') {
    y += 3;
    scale = stageScale * 0.96;
    rotate = -4;
  } else if (pet.mood.id === 'sulking') {
    mirror = true;
    scale = stageScale * 0.96;
    rotate = -2;
  } else if (pet.mood.id === 'hyper') {
    y -= 18;
  } else if (pet.mood.id === 'onFire') {
    y -= 2;
  }

  const px = 3.2;
  const safeScale = Math.max(0.2, scale);
  const sx = px * safeScale * (mirror ? -1 : 1);
  const sy = px * safeScale;
  return {
    attr: `translate(${x} ${y}) rotate(${rotate}) scale(${sx} ${sy})`,
    x,
    y,
    scale,
    mirror
  };
}

export function renderDragon(ctx) {
  const { pet, geo } = ctx;
  const transform = dragonTransform(pet, ctx.scene);
  const stage = pet.growth.id;
  const parts = [];
  const bodyHalf = Array.isArray(geo.rows) ? Math.max(...geo.rows) + 5 : 27;
  const shadow = [
    `<ellipse cx="0" cy="3" rx="${bodyHalf + 3}" ry="6.5" fill="#0B1B1C" opacity=".16"/>`,
    `<ellipse cx="0" cy="2" rx="${bodyHalf}" ry="4.5" fill="#0B1B1C" opacity=".22"/>`
  ].join('');
  parts.push(shadow);

  if (stage === 'egg') {
    parts.push(drawEggAura(ctx));
    parts.push(drawEggWings(ctx));
    parts.push(drawEgg(ctx));
    parts.push(drawAccessories(ctx, 'egg-body'));
    parts.push(drawAccessories(ctx, 'egg-overlay'));
    parts.push(drawCompanion(ctx));
    parts.push(drawMoodEffects(ctx));
    parts.push(drawAccessories(ctx, 'floating'));
  } else {
    parts.push(drawAura(ctx));
    parts.push(drawTail(ctx));
    parts.push(drawWing(ctx, 'back'));
    parts.push(drawWing(ctx, 'front'));
    parts.push(drawBody(ctx));
    parts.push(drawAccessories(ctx, 'body'));
    parts.push(drawHead(ctx));
    if (pet.mood.id !== 'sulking' && pet.mood.id !== 'asleep') {
      parts.push(drawFace(ctx));
    }
    if (pet.accessories.scarf) parts.push(drawAccessories(ctx, 'neck'));
    parts.push(drawAccessories(ctx, 'head'));
    parts.push(drawBreath(ctx));
    parts.push(drawAccessories(ctx, 'held'));
    if (pet.mood.id === 'sleepy' || pet.mood.id === 'asleep') parts.push(drawTailCurl(ctx));
    parts.push(drawShinyScales(ctx));
    parts.push(drawCompanion(ctx));
    parts.push(drawMoodEffects(ctx));
    parts.push(drawAccessories(ctx, 'floating'));
  }

  return {
    transform,
    markup: `<g transform="${transform.attr}" class="dragon-stage dragon-${pet.growth.id} mood-${pet.mood.id}" shape-rendering="crispEdges"><g class="dragon-motion">${parts.join('')}</g></g>`
  };
}

export function dragonAnchors(pet) {
  return pet.growth.id === 'egg' ? GEOMETRY.egg : GEOMETRY[pet.growth.id];
}
