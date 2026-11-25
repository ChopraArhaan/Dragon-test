import { REWARD_COLORS } from './palette.js';
import {
  rect,
  pixelRoundRect,
  pixelCircle,
  pixelDiamond,
  pixelHeart,
  sparkle,
  flame,
  gem,
  pixelLine
} from './primitives.js';

function crown(cx, top, scale = 1) {
  const w = 10 * scale;
  const y = top - 7 * scale;
  return `<g class="crown">${[
    rect(cx - w, y + 4 * scale, w * 2, 4 * scale, REWARD_COLORS.crownShade),
    rect(cx - w, y + 1 * scale, w * 2, 4 * scale, REWARD_COLORS.crown),
    rect(cx - w, y - 3 * scale, 4 * scale, 5 * scale, REWARD_COLORS.crown),
    rect(cx - 2 * scale, y - 6 * scale, 4 * scale, 8 * scale, REWARD_COLORS.crown),
    rect(cx + w - 4 * scale, y - 3 * scale, 4 * scale, 5 * scale, REWARD_COLORS.crown),
    rect(cx - w + 1 * scale, y - 3 * scale, 2 * scale, 2 * scale, REWARD_COLORS.crownLight),
    rect(cx - 1 * scale, y - 6 * scale, 2 * scale, 2 * scale, REWARD_COLORS.crownLight),
    rect(cx + w - 3 * scale, y - 3 * scale, 2 * scale, 2 * scale, REWARD_COLORS.crownLight),
    rect(cx - 2 * scale, y + 2 * scale, 3 * scale, 3 * scale, '#E85D75')
  ].join('')}</g>`;
}

function partyHat(cx, top, scale = 1) {
  const y = top - 2 * scale;
  return `<g class="party-hat">${[
    rect(cx - 9 * scale, y, 18 * scale, 4 * scale, REWARD_COLORS.partyBlue),
    rect(cx - 7 * scale, y - 4 * scale, 14 * scale, 4 * scale, REWARD_COLORS.partyPink),
    rect(cx - 5 * scale, y - 8 * scale, 10 * scale, 4 * scale, REWARD_COLORS.partyBlue),
    rect(cx - 3 * scale, y - 12 * scale, 6 * scale, 4 * scale, REWARD_COLORS.partyPink),
    rect(cx - 1 * scale, y - 15 * scale, 3 * scale, 3 * scale, REWARD_COLORS.crown),
    pixelCircle(cx, y - 17 * scale, 2.4 * scale, REWARD_COLORS.crownLight, 1)
  ].join('')}</g>`;
}

function nightCap(cx, top, scale = 1) {
  const y = top - 2 * scale;
  return `<g class="night-cap">${[
    rect(cx - 9 * scale, y, 18 * scale, 4 * scale, REWARD_COLORS.nightCapShade),
    rect(cx - 7 * scale, y - 4 * scale, 16 * scale, 4 * scale, REWARD_COLORS.nightCap),
    rect(cx - 2 * scale, y - 8 * scale, 13 * scale, 4 * scale, REWARD_COLORS.nightCap),
    rect(cx + 5 * scale, y - 12 * scale, 9 * scale, 4 * scale, REWARD_COLORS.nightCap),
    rect(cx + 11 * scale, y - 15 * scale, 5 * scale, 4 * scale, REWARD_COLORS.nightCapShade),
    pixelCircle(cx + 16 * scale, y - 15 * scale, 2.4 * scale, '#FFF0B8', 1),
    rect(cx - 1 * scale, y - 7 * scale, 2 * scale, 2 * scale, '#FFF3B0'),
    rect(cx + 6 * scale, y - 11 * scale, 2 * scale, 2 * scale, '#FFF3B0'),
    rect(cx - 9 * scale, y + 4 * scale, 18 * scale, 2 * scale, '#FFF0B8')
  ].join('')}</g>`;
}

function glasses(eye, snout, palette, egg = false) {
  const x = eye.x - 2;
  const y = eye.y - 1;
  const w = eye.w + 6;
  const h = eye.h + 4;
  return `<g class="glasses">${[
    pixelRoundRect(x, y, w, h, 2, REWARD_COLORS.glasses),
    pixelRoundRect(x + 1.5, y + 1.5, w - 3, h - 3, 1, '#EAFBFF', 'opacity=".10"'),
    rect(x + 2, y + 2, w - 4, 1.5, REWARD_COLORS.glassesGlow, 'opacity=".8"'),
    rect(x + w, y + h * 0.35, egg ? 4 : 8, 1.5, REWARD_COLORS.glasses),
    rect(snout.x - 1, y + h * 0.3, 4, 1.5, REWARD_COLORS.glasses)
  ].join('')}</g>`;
}

function sunglasses(eye, snout) {
  const x = eye.x - 3;
  const y = eye.y - 1;
  const w = eye.w + 10;
  return `<g class="sunglasses">${[
    pixelRoundRect(x, y, w, 5.5, 1, '#111827'),
    rect(x + 2, y + 1, 4, 1.2, '#7BE3FF', 'opacity=".7"'),
    rect(x + w, y + 2, 7, 1.5, '#111827'),
    rect(snout.x + 4, y + 1.5, 3, 1.2, '#7BE3FF', 'opacity=".35"')
  ].join('')}</g>`;
}

function scarf(neck, scale = 1) {
  const x = neck.x - 1;
  const y = neck.y + 6;
  const w = neck.w + 2;
  return `<g class="scarf">${[
    rect(x, y, w, 4, REWARD_COLORS.scarfShade),
    rect(x, y, w, 3, REWARD_COLORS.scarf),
    rect(x, y + 3, w, 1, REWARD_COLORS.scarfLight),
    rect(x - 4, y + 2, 7, 6, REWARD_COLORS.scarf),
    rect(x - 7, y + 5, 6, 3, REWARD_COLORS.scarfShade),
    rect(x - 8, y + 8, 3, 3, REWARD_COLORS.scarf),
    rect(x - 4, y + 8, 3, 3, REWARD_COLORS.scarf),
    rect(x + w + 2, y + 2, 3, 7, REWARD_COLORS.scarfShade)
  ].join('')}</g>`;
}

function eggScarf(scale = 1) {
  return `<g class="scarf egg-scarf">${[
    rect(-14, -17, 28, 4 * scale, REWARD_COLORS.scarfShade),
    rect(-14, -17, 28, 3 * scale, REWARD_COLORS.scarf),
    rect(-18, -14, 7, 5, REWARD_COLORS.scarf),
    rect(-21, -11, 6, 3, REWARD_COLORS.scarfShade),
    rect(-22, -8, 3, 3, REWARD_COLORS.scarf),
    rect(-18, -8, 3, 3, REWARD_COLORS.scarf),
    rect(13, -15, 3, 7, REWARD_COLORS.scarfShade)
  ].join('')}</g>`;
}

function rustArmor(geo) {
  const x = geo.belly.x + 1;
  const y = geo.belly.y + 5;
  const w = geo.belly.w - 2;
  return `<g class="rust-armor">${[
    pixelRoundRect(x, y, w, 12, 2, '#7A3F1D'),
    pixelRoundRect(x + 1, y + 1, w - 2, 10, 2, '#C96A2D'),
    rect(x + 2, y + 3, w - 4, 1.5, '#F0A55E'),
    rect(x + 2, y + 8, 2, 2, '#FFD27A'),
    rect(x + w - 4, y + 8, 2, 2, '#FFD27A'),
    rect(x + w - 6, y - 3, 5, 5, '#A95524'),
    rect(x + w - 5, y - 2, 3, 3, '#E6914D')
  ].join('')}</g>`;
}

function javascriptScales(geo) {
  return `<g class="js-scales">${[
    rect(-geo.rows[4], geo.bodyTop + 5, 3, 2, '#F7DF4F'),
    rect(-geo.rows[6] + 2, geo.bodyTop + 12, 3, 2, '#F7DF4F'),
    rect(-geo.rows[8] + 1, geo.bodyTop + 20, 3, 2, '#F7DF4F')
  ].join('')}</g>`;
}

function flag(paw, scale = 1) {
  const x = paw.x + 2;
  const y = paw.y;
  return `<g transform="translate(${x} ${y})">${[
    rect(0, -28 * scale, 2 * scale, 28 * scale, '#D9E2EC'),
    `<g class="flag-wave">${rect(2 * scale, -28 * scale, 18 * scale, 11 * scale, REWARD_COLORS.scarf)}${rect(2 * scale, -28 * scale, 18 * scale, 2 * scale, REWARD_COLORS.scarfLight)}<path d="M${20 * scale} ${-28 * scale} L${27 * scale} ${-22.5 * scale} L${20 * scale} ${-17 * scale} Z" fill="${REWARD_COLORS.scarf}"/></g>`,
    rect(-1, -2, 4, 3, '#8A98A8')
  ].join('')}</g>`;
}

function coin(paw) {
  return `<g transform="translate(${paw.x + 5} ${paw.y + 2})"><g class="coin">${[
    pixelCircle(0, 0, 6, REWARD_COLORS.coinShade, 1),
    pixelCircle(0, 0, 5, REWARD_COLORS.coin, 1),
    rect(-1, -3, 2, 6, '#FFF1A0'),
    rect(-3, -1, 6, 2, '#FFF1A0'),
    sparkle(0, -1, 1.6, '#FFFDF5')
  ].join('')}</g></g>`;
}

function coffee(paw) {
  return `<g class="coffee" transform="translate(${paw.x + 4} ${paw.y - 2})">${[
    pixelRoundRect(0, 0, 10, 8, 1, '#D8C6A8'),
    pixelRoundRect(1, 1, 8, 6, 1, REWARD_COLORS.coffee),
    rect(2, 2, 6, 2, '#6F4A34'),
    rect(9, 2, 3, 4, '#D8C6A8'),
    rect(10, 3, 2, 2, REWARD_COLORS.coffee),
    `<g class="steam" style="animation-delay:-.3s">${rect(3, -4, 1.5, 3, '#D8E6EA', 'opacity=".55"')}${rect(5, -6, 1.5, 3, '#D8E6EA', 'opacity=".4"')}</g>`,
    `<g class="steam" style="animation-delay:-1.1s">${rect(6, -3, 1.5, 3, '#D8E6EA', 'opacity=".35"')}</g>`
  ].join('')}</g>`;
}

function sword(paw) {
  return `<g class="sword" transform="translate(${paw.x + 9} ${paw.y})">${[
    rect(0, -32, 3, 32, '#D6E4F2'),
    rect(-2, -6, 7, 2, '#7DB7E8'),
    rect(-1, -8, 5, 2, '#4D8BC4'),
    rect(0, -34, 3, 3, '#FFFFFF'),
    rect(-4, -1, 11, 3, '#5A7185')
  ].join('')}</g>`;
}

function plantFlag() {
  return `<g transform="translate(21 -6)">${[
    rect(0, -30, 2, 30, '#D9E2EC'),
    `<g class="flag-wave">${rect(2, -30, 16, 10, REWARD_COLORS.scarf)}${rect(2, -30, 16, 2, REWARD_COLORS.scarfLight)}<path d="M18 -30 L24 -25 L18 -20 Z" fill="${REWARD_COLORS.scarf}"/></g>`,
    rect(-1, -2, 4, 3, '#8A98A8')
  ].join('')}</g>`;
}

function plantCoin() {
  return `<g transform="translate(-24 -2)"><g class="coin">${pixelCircle(0, 0, 6, REWARD_COLORS.coinShade, 1)}${pixelCircle(0, 0, 5, REWARD_COLORS.coin, 1)}${rect(-1, -3, 2, 6, '#FFF1A0')}${rect(-3, -1, 6, 2, '#FFF1A0')}</g></g>`;
}

function plantCoffee() {
  return `<g class="coffee" transform="translate(-33 -6)">${pixelRoundRect(0, 0, 10, 8, 1, '#D8C6A8')}${pixelRoundRect(1, 1, 8, 6, 1, REWARD_COLORS.coffee)}${rect(2, 2, 6, 2, '#6F4A34')}${rect(9, 2, 3, 4, '#D8C6A8')}<g class="steam">${rect(3, -4, 1.5, 3, '#D8E6EA', 'opacity=".5"')}${rect(6, -5, 1.5, 3, '#D8E6EA', 'opacity=".35"')}</g></g>`;
}

function headwear(ctx, egg = false) {
  const { geo, pet } = ctx;
  const cx = egg ? 0 : geo.headCenterX;
  const top = egg ? -40 : geo.headTop;
  const scale = egg ? 0.75 : pet.growth.id === 'hatchling' ? 0.75 : 1;
  let out = '';
  if (pet.accessories.crown) out += crown(cx, top, scale);
  if (pet.accessories.partyHat) out += partyHat(cx - 2, top - (pet.accessories.crown ? 4 : 0), scale);
  if (pet.accessories.nightCap) out += nightCap(cx + 2, top - (pet.accessories.crown ? 2 : 0), scale);
  return out;
}

function faceWear(ctx, egg = false) {
  const { geo, pet } = ctx;
  let out = '';
  if (egg) {
    if (pet.accessories.glasses) {
      out += `<g transform="translate(-5 -29)">${pixelRoundRect(0, 0, 14, 8, 2, REWARD_COLORS.glasses)}${rect(2, 2, 10, 1.5, REWARD_COLORS.glassesGlow, 'opacity=".8"')}${rect(14, 3, 5, 1.5, REWARD_COLORS.glasses)}</g>`;
    }
    if (pet.accessories.sunglasses) {
      out += `<g transform="translate(-7 -30)">${pixelRoundRect(0, 0, 18, 5, 1, '#111827')}${rect(2, 1, 4, 1, '#7BE3FF', 'opacity=".65"')}</g>`;
    }
    return out;
  }
  if (pet.accessories.glasses) out += glasses(geo.eye, geo.snout, ctx.palette);
  if (pet.accessories.sunglasses) out += sunglasses(geo.eye, geo.snout);
  return out;
}

function hearts(ctx, egg = false) {
  if (!ctx.pet.accessories.heartEyes && !ctx.pet.accessories.confetti) return '';
  const cx = egg ? 0 : (ctx.geo.headCenterX || 0);
  const top = egg ? -48 : (ctx.geo.headTop || -70);
  let out = '';
  if (ctx.pet.accessories.heartEyes) {
    out += `<g class="heart-float" style="animation-delay:-.3s">${pixelHeart(cx - 24, top - 8, 1.1, '#EF5D7A')}</g>`;
    out += `<g class="heart-float" style="animation-delay:-1.1s">${pixelHeart(cx + 14, top - 15, 0.8, '#FF8FA3')}</g>`;
  }
  return out;
}

function eggOverlay(ctx) {
  const { pet } = ctx;
  let out = '';
  out += headwear(ctx, true);
  out += faceWear(ctx, true);
  if (pet.accessories.flag) out += plantFlag();
  if (pet.accessories.coin) out += plantCoin();
  if (pet.accessories.coffee) out += plantCoffee();
  if (pet.accessories.confetti) out += `<g class="sparkle">${sparkle(-27, -35, 2.5, '#FFD166')}${sparkle(18, -18, 2, '#8DE8FF')}</g>`;
  return out;
}

export function drawAccessories(ctx, layer) {
  const { pet, geo } = ctx;
  const stage = pet.growth.id;
  const companion = pet.accessories.companion;

  if (layer === 'body') {
    let out = '';
    if (companion === 'rust') out += rustArmor(geo);
    if (companion === 'javascript') out += javascriptScales(geo);
    return out;
  }

  if (layer === 'neck') {
    if (!pet.accessories.scarf) return '';
    return scarf(geo.neck);
  }

  if (layer === 'head') {
    return `${headwear(ctx)}${faceWear(ctx)}`;
  }

  if (layer === 'held') {
    let out = '';
    if (pet.accessories.flag) out += flag(geo.paw);
    if (pet.accessories.coin) out += coin(geo.paw);
    if (pet.accessories.coffee) out += coffee(geo.paw);
    if (companion === 'blade') out += sword(geo.paw);
    return out;
  }

  if (layer === 'egg-body') {
    if (pet.accessories.scarf) return eggScarf();
    return '';
  }

  if (layer === 'egg-overlay') {
    return eggOverlay(ctx);
  }

  if (layer === 'floating') {
    return hearts(ctx, stage === 'egg');
  }

  return '';
}

function pythonCompanion(x, y) {
  return `<g transform="translate(${x} ${y})" class="companion python-snake">${[
    pixelRoundRect(-12, -4, 20, 6, 3, '#2E7D4F'),
    pixelRoundRect(-6, -8, 14, 7, 3, '#3E9E63'),
    pixelRoundRect(2, -14, 10, 9, 3, '#4DBB76'),
    pixelRoundRect(2, -18, 9, 6, 3, '#5BD68A'),
    rect(3, -16, 2, 2, '#12251B'),
    rect(8, -16, 2, 2, '#12251B'),
    rect(10, -9, 4, 1, '#FF6B6B'),
    rect(14, -10, 3, 1, '#FF6B6B'),
    rect(-10, -2, 3, 2, '#C8E66B'),
    rect(-4, -9, 2, 2, '#C8E66B'),
    rect(1, -13, 2, 2, '#C8E66B')
  ].join('')}</g>`;
}

function gopherCompanion(x, y) {
  return `<g transform="translate(${x} ${y})" class="companion go-gopher">${[
    pixelRoundRect(-8, -20, 16, 20, 4, '#8C6138'),
    pixelRoundRect(-6, -22, 12, 5, 3, '#A97745'),
    rect(-8, -17, 4, 5, '#6F4A2C'),
    rect(4, -17, 4, 5, '#6F4A2C'),
    rect(-5, -13, 3, 3, '#F5E9D0'),
    rect(2, -13, 3, 3, '#F5E9D0'),
    rect(-4, -12, 2, 2, '#1B1712'),
    rect(2, -12, 2, 2, '#1B1712'),
    rect(-2, -8, 4, 3, '#F5E9D0'),
    rect(-5, -6, 2, 3, '#FFF8E7'),
    rect(3, -6, 2, 3, '#FFF8E7')
  ].join('')}</g>`;
}

function mugCompanion(x, y) {
  return `<g transform="translate(${x} ${y})" class="companion java-mug">${[
    pixelRoundRect(0, -10, 10, 10, 2, '#005A8C'),
    pixelRoundRect(1, -9, 8, 8, 1, '#F3EAD8'),
    rect(2, -8, 6, 2, '#583F2B'),
    rect(9, -8, 3, 5, '#005A8C'),
    `<g class="steam" style="animation-delay:-.4s">${rect(3, -15, 1.5, 4, '#D8E6EA', 'opacity=".45"')}${rect(6, -17, 1.5, 4, '#D8E6EA', 'opacity=".3"')}</g>`
  ].join('')}</g>`;
}

function rubyGem(x, y) {
  return `<g transform="translate(${x} ${y})" class="companion ruby-gem">${pixelDiamond(0, -10, 6, '#B3324D')}${pixelDiamond(0, -11, 4, '#E85D75')}${rect(-1, -16, 2, 2, '#FFF0F4', 'opacity=".8"')}</g>`;
}

function terminalCompanion(x, y) {
  return `<g transform="translate(${x} ${y})" class="companion shell-terminal">${[
    pixelRoundRect(0, -18, 18, 14, 2, '#0B1118'),
    pixelRoundRect(1, -17, 16, 12, 1, '#13202B'),
    rect(3, -14, 2, 2, '#63D39A'),
    rect(6, -14, 5, 1, '#63D39A'),
    rect(3, -11, 8, 1, '#8FA5C5'),
    rect(12, -14, 2, 4, '#63D39A')
  ].join('')}</g>`;
}

function brushCompanion(x, y) {
  return `<g transform="translate(${x} ${y})" class="companion html-brush">${[
    pixelLine(0, 0, 10, -22, 2, '#B77B48'),
    rect(8, -27, 6, 8, '#D9DEE7'),
    rect(9, -29, 4, 3, '#E85D75'),
    rect(9, -26, 4, 3, '#F2C14E'),
    rect(9, -23, 4, 2, '#63B6E8')
  ].join('')}</g>`;
}

function gearCompanion(x, y) {
  return `<g transform="translate(${x} ${y})" class="companion rust-gear">${[
    pixelCircle(0, -12, 7, '#A95524', 1),
    pixelCircle(0, -12, 4, '#F0A55E', 1),
    rect(-2, -22, 4, 5, '#C96A2D'),
    rect(-2, -7, 4, 5, '#C96A2D'),
    rect(-11, -14, 5, 4, '#C96A2D'),
    rect(6, -14, 5, 4, '#C96A2D'),
    pixelCircle(0, -12, 2, '#4A2A18', 1)
  ].join('')}</g>`;
}

export function drawCompanion(ctx) {
  const { pet, geo } = ctx;
  const companion = pet.accessories.companion;
  if (!companion) return '';
  const egg = pet.growth.id === 'egg';
  const x = egg ? 35 : geo.paw.x + 14;
  const y = egg ? 2 : 0;
  let out = '';

  if (companion === 'python') out = pythonCompanion(x, y);
  else if (companion === 'go') out = gopherCompanion(x, y);
  else if (companion === 'java') out = mugCompanion(x, y);
  else if (companion === 'ruby') out = rubyGem(x, y);
  else if (companion === 'terminal') out = terminalCompanion(x, y);
  else if (companion === 'brush') out = brushCompanion(x, y);
  else if (companion === 'rust') out = gearCompanion(x, y);
  else {
    const color = ctx.languageColor || '#F2C14E';
    const light = companion === 'javascript'
      ? '#FFF09A'
      : companion === 'typescript'
        ? '#9DD9FF'
        : '#FFF5D6';
    out = `<g transform="translate(${x} ${y})" class="companion language-gem">${gem(0, -16, 6, color, light)}${sparkle(9, -24, 2, '#FFF3B0')}</g>`;
  }

  return `<g class="companion-wrap">${out}</g>`;
}
