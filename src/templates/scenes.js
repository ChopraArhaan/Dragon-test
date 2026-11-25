import { SCENES } from './palette.js';
import { rect, pixelBlob, pixelCircle, cloud, sun, moon, sparkle } from './primitives.js';

function themeFor(scene) {
  if (scene.beach) {
    if (scene.base === 'night') return 'nightBeach';
    if (scene.base === 'sunset') return 'sunsetBeach';
    return 'beach';
  }
  return scene.base;
}

export function scenePalette(scene) {
  return SCENES[themeFor(scene)];
}

function mountainRange(width, baseY, color, peaks, heightScale = 1) {
  const step = 8;
  const columns = Math.ceil(width / step);
  let out = '';
  for (let index = 0; index < columns; index += 1) {
    const t = (index / columns) * peaks.length;
    const lower = Math.floor(t);
    const fraction = t - lower;
    const start = peaks[lower % peaks.length];
    const end = peaks[(lower + 1) % peaks.length];
    const height = (start + (end - start) * fraction) * heightScale;
    out += rect(index * step, baseY - height, step + 0.5, height + 48, color);
  }
  return out;
}

function stars(width, height, count, color) {
  const spots = [
    [42, 72, 2], [93, 118, 1.5], [152, 58, 2.5], [211, 96, 1.5], [267, 52, 2],
    [332, 112, 1.5], [389, 70, 2], [448, 46, 1.5], [502, 120, 2], [568, 62, 1.5],
    [611, 100, 2], [350, 158, 1.5], [128, 162, 1.5], [238, 143, 1.5], [475, 158, 1]
  ].slice(0, count);
  return spots
    .map(([x, y, r], index) => `<g class="star" style="animation-delay:${(-index * 0.37).toFixed(2)}s">${sparkle(x, y, r * 1.8, color, 'opacity=".75"')}</g>`)
    .join('');
}

function fireflies() {
  const spots = [
    [92, 280], [154, 324], [486, 300], [552, 262], [408, 336], [244, 252]
  ];
  return spots
    .map(([x, y], index) => `<g class="firefly" style="animation-delay:${-index * 0.8}s">${pixelCircle(x, y, 2, '#FFE88A', 1, 'opacity=".75"')}<circle cx="${x}" cy="${y}" r="8" fill="#FFE88A" opacity=".08"/></g>`)
    .join('');
}

function grassTufts(groundY, width, color) {
  const xs = [24, 58, 101, 167, 208, 279, 352, 425, 486, 541, 601];
  return xs
    .map((x, index) => {
      const y = groundY - 2 - (index % 3) * 2;
      return [
        rect(x, y - 5, 2, 7, color),
        rect(x - 3, y - 3, 3, 2, color),
        rect(x + 2, y - 4, 3, 2, color)
      ].join('');
    })
    .join('');
}

function beachDetails(scene, width, groundY) {
  const towelX = scene.dragonX - 92;
  const towelY = groundY - 4;
  const stripes = Array.from({ length: 9 }, (_, index) =>
    rect(towelX + index * 20, towelY, 20, 20, index % 2 ? '#F7E3B2' : '#E86157')
  ).join('');
  const umbrella = `<g class="beach-umbrella">${[
    rect(96, 300, 4, 90, '#D6A45E'),
    pixelBlob([8, 20, 34, 46, 52, 48, 38, 22], 98, 250, '#F2C14E', 4),
    pixelBlob([6, 16, 26, 34, 38, 34, 26, 14], 98, 252, '#FFF2D0', 4, 'opacity=".6"'),
    rect(48, 300, 100, 6, '#E86157'),
    rect(54, 306, 88, 5, '#F7E3B2')
  ].join('')}</g>`;
  const waterWaves = [0, 1, 2, 3, 4, 5, 6, 7]
    .map((index) => {
      const x = 12 + index * 78;
      const y = 332 + (index % 2) * 6;
      return `<g class="wave" style="animation-delay:${-index * 0.45}s">${rect(x, y, 46, 3, '#DFF7F4', 'opacity=".55"')}${rect(x + 10, y - 4, 26, 2, '#DFF7F4', 'opacity=".35"')}</g>`;
    })
    .join('');
  return `<g>${waterWaves}${umbrella}${stripes}${rect(towelX, towelY + 20, 180, 4, '#B77A47', 'opacity=".4"')}</g>`;
}

function cobwebs(width) {
  const x = width - 150;
  return `<g class="cobwebs" opacity=".52">${[
    `<path d="M${width - 150} 0 V150 M${width - 120} 0 V126 M${width - 85} 0 V102 M${width - 48} 0 V82" stroke="#DCE6F2" stroke-width="1.2" opacity=".36"/>`,
    `<path d="M${width - 150} 38 C${width - 90} 52 ${width - 42} 104 ${width - 8} 146" fill="none" stroke="#DCE6F2" stroke-width="1.2" opacity=".34"/>`,
    `<path d="M${width - 150} 72 C${width - 94} 84 ${width - 48} 122 ${width - 16} 160" fill="none" stroke="#DCE6F2" stroke-width="1" opacity=".26"/>`,
    `<path d="M${width - 120} 12 C${width - 70} 42 ${width - 40} 72 ${width - 10} 108" fill="none" stroke="#DCE6F2" stroke-width="1" opacity=".28"/>`,
    rect(x + 18, 54, 3, 3, '#B8C8DA', 'opacity=".7"'),
    rect(x + 19, 57, 2, 2, '#B8C8DA', 'opacity=".7"')
  ].join('')}</g>`;
}

function dust() {
  const spots = [[512, 330], [550, 356], [584, 310], [470, 290], [610, 340], [538, 250]];
  return spots
    .map(([x, y], index) => `<g class="dust" style="animation-delay:${-index * 1.1}s">${rect(x, y, 3, 3, '#D8C8A2', 'opacity=".35"')}${rect(x + 5, y + 5, 2, 2, '#D8C8A2', 'opacity=".25"')}</g>`)
    .join('');
}

function groundTexture(groundY, width, p) {
  const dashes = [
    [26, 20, 26], [96, 44, 18], [188, 14, 30], [276, 58, 22], [372, 26, 28],
    [452, 66, 20], [536, 38, 26], [604, 76, 24], [140, 84, 30], [330, 92, 24]
  ];
  const pebbles = [[64, 30, 4], [214, 62, 3], [404, 48, 4], [502, 84, 3], [578, 22, 4]];
  return [
    ...dashes.map(([x, dy, w]) => rect(x, groundY + dy, w, 3, p.groundDark, 'opacity=".35"')),
    ...pebbles.map(([x, dy, s]) => rect(x, groundY + dy, s, s, p.groundDark, 'opacity=".6"'))
  ].join('');
}

export function renderBackdrop({ scene, pet, width, height, groundY }) {
  const p = scenePalette(scene);
  const night = scene.base === 'night';
  const sunrise = scene.base === 'sunrise';
  const sunset = scene.base === 'sunset';
  const theme = themeFor(scene);
  const isBeach = Boolean(scene.beach);

  const sky = `<rect width="${width}" height="${height}" fill="url(#skyGradient)"/>`;
  const orb = night
    ? moon(536, 94, 32, p.sun)
    : sun(536, sunrise ? 190 : 92, sunrise ? 42 : 34, p, true);
  const starfield = night || sunset ? stars(width, height, night ? 15 : 6, p.star) : '';
  const clouds = [
    cloud(28, 132, 1.55, p.cloud, 0.42, 'cloud cloud-a'),
    cloud(222, 96, 1.15, p.cloud, 0.34, 'cloud cloud-b'),
    cloud(404, 148, 1.7, p.cloud, 0.26, 'cloud cloud-c')
  ].join('');

  const far = mountainRange(width, groundY - 34, p.far, [18, 42, 30, 58, 36, 22, 48, 27, 52, 34, 20, 44, 28, 50, 32, 40], 1);
  const near = mountainRange(width, groundY - 12, p.near, [10, 24, 38, 18, 28, 44, 20, 32, 26, 40, 16, 30, 22, 36, 18, 26], 0.7);

  let ground = '';
  if (isBeach) {
    ground = [
      rect(0, groundY - 48, width, 30, p.near),
      rect(0, groundY - 20, width, height - groundY + 20, p.ground),
      rect(0, groundY - 20, width, 6, p.groundLight),
      beachDetails(scene, width, groundY)
    ].join('');
  } else {
    ground = [
      rect(0, groundY - 14, width, height - groundY + 14, p.ground),
      rect(0, groundY - 14, width, 6, p.groundLight),
      grassTufts(groundY, width, p.groundDark)
    ].join('');
  }

  const sleepingCorner = pet.mood.id === 'asleep'
    ? `${cobwebs(width)}${dust()}`
    : '';

  const foreground = [
    isBeach ? '' : `<g opacity=".8">${grassTufts(groundY + 10, width, p.groundDark)}</g>`,
    night ? fireflies() : '',
    sleepingCorner
  ].join('');

  return `<g clip-path="url(#sceneClip)">${sky}${starfield}${orb}${clouds}${far}${near}${ground}${foreground}${isBeach ? '' : groundTexture(groundY, width, p)}</g>`;
}
