import {
  rect,
  pixelRoundRect,
  pixelHeart,
  sparkle,
  pixelCircle,
  flame
} from './primitives.js';

function eyeGroup(content, { blink = false, className = '' } = {}) {
  const cls = [blink ? 'eye-blink' : '', className].filter(Boolean).join(' ');
  return `<g${cls ? ` class="${cls}"` : ''}>${content}</g>`;
}

function openEye(eye, pupilColor = '#16242B', irisColor = null) {
  const cx = eye.x + eye.w / 2;
  const cy = eye.y + eye.h / 2;
  const pupil = irisColor
    ? [
        rect(cx - eye.w * 0.32, cy - eye.h * 0.28, eye.w * 0.64, eye.h * 0.58, irisColor),
        rect(cx - 1, cy - 1, 3, eye.h * 0.4, pupilColor)
      ].join('')
    : rect(cx - 1.5, eye.y + eye.h * 0.27, 3, eye.h * 0.46, pupilColor);
  return [
    pixelRoundRect(eye.x, eye.y, eye.w, eye.h, 2, '#FFF9E8'),
    pupil,
    rect(eye.x + 2, eye.y + 2, 1.5, 2.2, '#FFFFFF', 'opacity=".9"')
  ].join('');
}

function sleepyEye(eye, palette) {
  return [
    rect(eye.x, eye.y + eye.h / 2, eye.w, 2, palette.outline),
    rect(eye.x + eye.w - 2, eye.y + eye.h / 2 - 2, 2, 2, palette.outline)
  ].join('');
}

function happyArc(eye, palette) {
  const mid = eye.y + eye.h * 0.62;
  return [
    rect(eye.x + 1, mid, eye.w - 2, 2, palette.outline),
    rect(eye.x, mid + 2, 2, 2, palette.outline),
    rect(eye.x + eye.w - 2, mid + 2, 2, 2, palette.outline)
  ].join('');
}

function proudEye(eye, palette) {
  const mid = eye.y + eye.h * 0.5;
  return [
    rect(eye.x + 1, mid + 2, eye.w - 2, 2, palette.outline),
    rect(eye.x, mid, 2, 2, palette.outline),
    rect(eye.x + eye.w - 2, mid, 2, 2, palette.outline)
  ].join('');
}

function mouthMarkup(geo, palette, mood, accessories) {
  const { x, y } = geo.mouth;
  const open = mood === 'hyper' || mood === 'onFire' || mood === 'hungry' || accessories.roar;
  if (mood === 'sleepy' || mood === 'asleep') {
    return `<g class="sleep-mouth">${pixelCircle(x + 2, y, 2, palette.outline, 1)}</g>`;
  }
  if (mood === 'peckish') {
    return [rect(x, y + 1, 7, 1.5, palette.outline), rect(x + 1, y + 2.5, 2, 1, palette.outline)].join('');
  }
  if (open) {
    const width = mood === 'onFire' ? 12 : 10;
    return [
      pixelRoundRect(x, y - 1, width, 7, 2, palette.outline),
      pixelRoundRect(x + 1, y, width - 2, 2, '#7D2D36'),
      rect(x + 2, y + 2, width - 4, 3, '#E76470'),
      rect(x + 2, y - 1, 2, 2, '#FFF3D2'),
      rect(x + width - 4, y - 1, 2, 2, '#FFF3D2')
    ].join('');
  }
  if (accessories.proud || mood === 'happy') {
    return [rect(x, y, 7, 1.5, palette.outline), rect(x + 1, y + 1.5, 5, 1.5, palette.outline)].join('');
  }
  return rect(x + 1, y + 1, 6, 1.5, palette.outline);
}

function browMarkup(geo, palette, mood) {
  if (!['onFire', 'hungry', 'hyper'].includes(mood)) return '';
  const { eye } = geo;
  return [
    rect(eye.x - 1, eye.y - 3, 5, 1.5, palette.outline),
    rect(eye.x + 2, eye.y - 1.5, 4, 1.5, palette.outline)
  ].join('');
}

export function drawFace(ctx) {
  const { geo, palette, pet } = ctx;
  const mood = pet.mood.id;
  const accessories = pet.accessories;
  const eye = geo.eye;
  const cx = eye.x + eye.w / 2;
  const cy = eye.y + eye.h / 2;

  let eyes;
  if (accessories.heartEyes) {
    eyes = `<g class="heart-eyes">${pixelHeart(cx - 4, cy - 4, 1.15, '#EF5D7A')}${sparkle(cx + eye.w + 4, cy - 4, 2, '#FFB3C7')}</g>`;
  } else if (mood === 'sleepy' || mood === 'asleep') {
    eyes = eyeGroup(sleepyEye(eye, palette));
  } else if (accessories.proud) {
    eyes = eyeGroup(proudEye(eye, palette));
  } else if (mood === 'peckish') {
    eyes = eyeGroup([
      pixelRoundRect(eye.x, eye.y + 2, eye.w, eye.h - 2, 2, '#FFF9E8'),
      rect(cx - 1.5, eye.y + eye.h * 0.45, 3, eye.h * 0.35, '#16242B'),
      rect(eye.x, eye.y + 1, eye.w, 2, palette.outline)
    ].join(''));
  } else if (mood === 'onFire') {
    eyes = eyeGroup(openEye(eye, '#2C1C18', '#FF9B2F'), { className: 'eye-glow' });
  } else if (mood === 'hungry') {
    eyes = eyeGroup(openEye(eye, '#16242B', '#F2C14E'));
  } else if (mood === 'hyper') {
    eyes = eyeGroup(openEye(eye, '#16242B', '#47D7B2'));
  } else {
    eyes = eyeGroup(openEye(eye), { blink: true });
  }

  const cheeks =
    ['happy', 'hyper', 'onFire'].includes(mood) || accessories.heartEyes
      ? rect(geo.snout.x - 8, geo.snout.y + 5, 5, 2, palette.cheek, 'opacity=".7"')
      : '';

  const eyebrows = browMarkup(geo, palette, mood);
  const mouth = mouthMarkup(geo, palette, mood, accessories);
  const nostril = rect(geo.nostril.x, geo.nostril.y, 2, 2, palette.outline);

  return `<g class="face">${eyes}${eyebrows}${cheeks}${nostril}${mouth}</g>`;
}

function pixelZ(x, y, scale, fill, extra = '') {
  return [
    rect(x, y, 6 * scale, 1.5 * scale, fill, extra),
    rect(x + 4 * scale, y + 1.5 * scale, 2 * scale, 1.5 * scale, fill, extra),
    rect(x + 2 * scale, y + 3 * scale, 2 * scale, 1.5 * scale, fill, extra),
    rect(x, y + 4.5 * scale, 6 * scale, 1.5 * scale, fill, extra)
  ].join('');
}

function rumbleLines(x, y, className = 'rumble') {
  return `<g class="${className}">${[
    rect(x, y, 4, 1, '#F2C14E', 'opacity=".7"'),
    rect(x + 6, y + 3, 5, 1, '#F2C14E', 'opacity=".6"'),
    rect(x + 2, y + 6, 3, 1, '#F2C14E', 'opacity=".5"')
  ].join('')}</g>`;
}

export function drawMoodEffects(ctx) {
  const { pet, geo, palette } = ctx;
  const mood = pet.mood.id;
  const parts = [];

  if (mood === 'sleepy' || mood === 'asleep') {
    const x = geo.headCenterX ?? 0;
    const y = geo.headTop - 8;
    parts.push(
      `<g class="zzz zzz-one">${pixelZ(x + 14, y - 7, 1, '#DDEBFF')}</g>`,
      `<g class="zzz zzz-two" style="animation-delay:-1s">${pixelZ(x + 21, y - 13, 0.8, '#BFD2EF')}</g>`,
      `<g class="zzz zzz-three" style="animation-delay:-2s">${pixelZ(x + 27, y - 18, 0.6, '#9DB4D6')}</g>`
    );
  }

  if (mood === 'hyper') {
    parts.push(
      `<g class="sparkle" style="animation-delay:-.2s">${sparkle(-42, -55, 3, '#8DE8FF')}</g>`,
      `<g class="sparkle" style="animation-delay:-.8s">${sparkle(43, -45, 2.5, '#FFF1A0')}</g>`,
      `<g class="sparkle" style="animation-delay:-1.3s">${sparkle(31, -13, 2, '#FFB3C7')}</g>`,
      `<g class="speed-lines">${rect(-58, -22, 9, 2, '#FFF3D2', 'opacity=".35"')}${rect(-52, -14, 6, 2, '#FFF3D2', 'opacity=".28"')}${rect(-62, -30, 5, 2, '#FFF3D2', 'opacity=".2"')}</g>`
    );
  }

  if (mood === 'onFire') {
    parts.push(
      `<ellipse cx="0" cy="-34" rx="44" ry="42" fill="#FF7A2F" opacity=".10"/>`,
      `<g class="shoulder-flame" style="animation-delay:-.2s">${flame(-24, -35, 10, 17, {
        outer: '#FF7A36',
        inner: '#FFD35C',
        core: '#FFF6D2',
        glow: '#FFB347'
      })}</g>`,
      `<g class="shoulder-flame" style="animation-delay:-.55s">${flame(17, -42, 8, 14, {
        outer: '#FF7A36',
        inner: '#FFD35C',
        core: '#FFF6D2',
        glow: '#FFB347'
      })}</g>`
    );
  }

  if (mood === 'hungry' || mood === 'peckish') {
    parts.push(rumbleLines(-28, -18, mood === 'hungry' ? 'rumble rumble-fast' : 'rumble'));
    parts.push(
      `<g class="roar-lines">${rect(geo.snout.x + geo.snout.w + 25, geo.snout.y - 2, 7, 1.5, '#FFD37F', 'opacity=".8"')}${rect(geo.snout.x + geo.snout.w + 30, geo.snout.y + 5, 9, 1.5, '#FFD37F', 'opacity=".6"')}${rect(geo.snout.x + geo.snout.w + 26, geo.snout.y + 12, 6, 1.5, '#FFD37F', 'opacity=".45"')}</g>`
    );
  }

  if (mood === 'happy') {
    parts.push(`<g class="sparkle" style="animation-delay:-.5s">${sparkle(-30, -50, 2.2, '#9DF3D8')}</g>`);
  }

  if (mood === 'asleep') {
    parts.push(`<g class="sleep-drool">${rect(geo.mouth?.x ?? 0, geo.mouth?.y ?? 0, 1.5, 4, '#9FD8E8', 'opacity=".3"')}</g>`);
  }

  return parts.join('');
}
