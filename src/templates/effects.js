import { UI } from './palette.js';
import { rect, pixelRoundRect, text, pixelCircle } from './primitives.js';

function drumstick(x, y) {
  return `<g transform="translate(${x} ${y})">${[
    pixelCircle(0, 0, 6, '#B66B3D', 1),
    pixelCircle(1, -1, 4, '#D98A55', 1),
    rect(4, -2, 7, 3, '#FFF0D2'),
    rect(10, -4, 3, 3, '#FFF0D2'),
    rect(10, 1, 3, 3, '#FFF0D2')
  ].join('')}</g>`;
}

export function hungerBar({ x, y, width, value, label }) {
  const segments = 20;
  const gap = 3;
  const cell = (width - gap * (segments - 1)) / segments;
  const filled = Math.round((value / 100) * segments);
  const color = value >= 60 ? '#63D39A' : value >= 30 ? '#F2C14E' : '#F07167';
  const cells = Array.from({ length: segments }, (_, index) =>
    rect(
      x + index * (cell + gap),
      y,
      cell,
      12,
      index < filled ? color : '#1A2B42',
      index < filled ? 'opacity=".95"' : 'opacity=".75"'
    )
  ).join('');
  return `<g class="hunger-bar">${drumstick(x - 18, y + 5)}${text(x + 2, y - 8, 'HUNGER', {
    size: 10,
    fill: UI.creamSoft,
    weight: 700,
    letter: 1.4
  })}${text(x + width, y - 8, `${label} ${value}%`, {
    size: 10,
    fill: color,
    weight: 700,
    anchor: 'end',
    letter: 0.8
  })}${pixelRoundRect(x - 3, y - 3, width + 6, 18, 3, '#0A1421', 'opacity=".45"')}${cells}</g>`;
}

export function confetti() {
  const colors = ['#F2C14E', '#F07167', '#79E0C0', '#8FD7E8', '#B68CF2', '#FFF3D2'];
  const pieces = [
    [58, 96, 5, 8, -1.1], [106, 72, 4, 6, -2.3], [168, 108, 6, 4, -0.8], [224, 62, 4, 7, -1.9],
    [286, 104, 5, 5, -2.7], [344, 78, 4, 8, -1.5], [402, 112, 6, 5, -0.4], [468, 68, 4, 7, -2.1],
    [524, 98, 5, 6, -1.2], [588, 76, 4, 8, -2.5], [74, 144, 4, 6, -2.8], [202, 152, 5, 4, -1.7],
    [322, 146, 4, 7, -0.6], [454, 150, 5, 5, -2.2], [562, 140, 4, 6, -1.4]
  ];
  return `<g class="confetti-field">${pieces
    .map(([x, y, w, h, delay], index) =>
      rect(x, y, w, h, colors[index % colors.length], `class="confetti" style="animation-delay:${delay}s"`)
    )
    .join('')}</g>`;
}

export function heartBurst(cx, cy) {
  return `<g class="heart-burst">${[
    [0, 0, 1.1, '#EF5D7A'],
    [-20, -12, 0.8, '#FF8FA3'],
    [20, -16, 0.7, '#FFB3C7']
  ]
    .map(([x, y, s, color], index) =>
      `<g transform="translate(${cx + x} ${cy + y})"><g class="heart-float" style="animation-delay:${-index * 0.7}s">${rect(-4 * s, -3 * s, 3 * s, 3 * s, color)}${rect(1 * s, -3 * s, 3 * s, 3 * s, color)}${rect(-4 * s, 0, 8 * s, 3 * s, color)}${rect(-2 * s, 3 * s, 4 * s, 2 * s, color)}</g></g>`
    )
    .join('')}</g>`;
}
