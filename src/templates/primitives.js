export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function n(value) {
  const rounded = Math.round(Number(value) * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function rect(x, y, w, h, fill, extra = '') {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}"${extra ? ` ${extra}` : ''}/>`;
}

export function group(content, attrs = '') {
  return `<g${attrs ? ` ${attrs}` : ''}>${content}</g>`;
}

export function text(x, y, content, options = {}) {
  const {
    size = 14,
    fill = '#FFF3D2',
    weight = 400,
    anchor = 'start',
    family = "ui-monospace, 'Cascadia Code', 'SFMono-Regular', Menlo, Consolas, monospace",
    letter = 0,
    class: className,
    opacity
  } = options;
  const pieces = [
    `x="${n(x)}"`,
    `y="${n(y)}"`,
    `font-family="${family}"`,
    `font-size="${size}"`,
    `font-weight="${weight}"`,
    `fill="${fill}"`,
    `text-anchor="${anchor}"`,
    `letter-spacing="${letter}"`
  ];
  if (className) pieces.push(`class="${className}"`);
  if (opacity != null) pieces.push(`opacity="${opacity}"`);
  return `<text ${pieces.join(' ')}>${esc(content)}</text>`;
}

export function pixelRoundRect(x, y, w, h, radius, fill, extra = '') {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const p = [
    `M${n(x + r)},${n(y)}`,
    `H${n(x + w - r)}`,
    `V${n(y + r)}`,
    `H${n(x + w)}`,
    `V${n(y + h - r)}`,
    `H${n(x + w - r)}`,
    `V${n(y + h)}`,
    `H${n(x + r)}`,
    `V${n(y + h - r)}`,
    `H${n(x)}`,
    `V${n(y + r)}`,
    `H${n(x + r)}`,
    'Z'
  ].join(' ');
  return `<path d="${p}" fill="${fill}"${extra ? ` ${extra}` : ''}/>`;
}

export function pixelBlob(rows, cx, top, fill, rowHeight = 2, extra = '') {
  return rows
    .map((halfWidth, index) =>
      rect(cx - halfWidth, top + index * rowHeight, halfWidth * 2, rowHeight + 0.32, fill, extra)
    )
    .join('');
}

export function outlinedBlob(rows, cx, top, outline, fill, rowHeight = 2, pad = 1) {
  const expanded = rows.map((halfWidth) => halfWidth + pad);
  return [
    pixelBlob(expanded, cx, top - pad, outline, rowHeight),
    pixelBlob(rows, cx, top, fill, rowHeight)
  ].join('');
}

export function pixelEllipse(cx, cy, rx, ry, fill, step = 2, extra = '') {
  const rows = [];
  for (let y = -ry; y < ry; y += step) {
    const t = (y + step / 2) / ry;
    const width = rx * Math.sqrt(Math.max(0, 1 - t * t));
    rows.push(Math.max(1, Math.round(width)));
  }
  return pixelBlob(rows, cx, cy - ry, fill, step, extra);
}

export function pixelDiamond(cx, cy, radius, fill, extra = '') {
  const rows = [];
  for (let i = 0; i < radius; i += 1) rows.push(i + 1);
  const full = [...rows, radius, ...rows.slice().reverse()];
  return full
    .map((width, index) => rect(cx - width, cy - radius + index, width * 2, 1, fill, extra))
    .join('');
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function pixelPolygon(points, fill, cell = 2, extra = '') {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.floor(Math.min(...xs) / cell) * cell;
  const maxX = Math.ceil(Math.max(...xs) / cell) * cell;
  const minY = Math.floor(Math.min(...ys) / cell) * cell;
  const maxY = Math.ceil(Math.max(...ys) / cell) * cell;
  let out = '';
  for (let y = minY; y < maxY; y += cell) {
    let runStart = null;
    for (let x = minX; x <= maxX; x += cell) {
      const filled = x < maxX && pointInPolygon(x + cell / 2, y + cell / 2, points);
      if (filled && runStart == null) runStart = x;
      if (!filled && runStart != null) {
        out += rect(runStart, y, x - runStart + 0.32, cell + 0.32, fill, extra);
        runStart = null;
      }
    }
  }
  return out;
}

export function scalePoints(points, factor, cx, cy) {
  return points.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor]);
}

export function pixelLine(x1, y1, x2, y2, size, fill, extra = '') {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))));
  let out = '';
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = Math.round((x1 + (x2 - x1) * t) / size) * size;
    const y = Math.round((y1 + (y2 - y1) * t) / size) * size;
    out += rect(x, y, size, size, fill, extra);
  }
  return out;
}

export function pixelCircle(cx, cy, radius, fill, step = 2, extra = '') {
  return pixelEllipse(cx, cy, radius, radius, fill, step, extra);
}

export function sparkle(cx, cy, size = 3, fill = '#FFF3B0', extra = '') {
  return [
    rect(cx - 1, cy - size, 2, size * 2 + 2, fill, extra),
    rect(cx - size, cy - 1, size * 2 + 2, 2, fill, extra)
  ].join('');
}

const HEART_ROWS = ['.11.11.', '1111111', '1111111', '.11111.', '..111..', '...1...'];

export function pixelHeart(cx, cy, scale, fill, extra = '') {
  let out = '';
  HEART_ROWS.forEach((row, y) => {
    row.split('').forEach((cell, x) => {
      if (cell === '1') out += rect(cx + x * scale, cy + y * scale, scale, scale, fill, extra);
    });
  });
  return out;
}

export function gem(cx, cy, size, fill, light, extra = '') {
  return [
    pixelDiamond(cx, cy, size, fill, extra),
    pixelDiamond(cx, cy - 1, Math.max(1, size - 2), light, extra),
    rect(cx - 1, cy - size - 1, 2, 2, '#FFFDF5', extra)
  ].join('');
}

export function flame(cx, baseY, width, height, colors, options = {}) {
  const { className = 'flame', style = '', glow = false } = options;
  const rows = 14;
  const profile = [0.10, 0.18, 0.20, 0.32, 0.30, 0.46, 0.58, 0.56, 0.74, 0.90, 0.84, 0.98, 0.72, 0.38];
  let outer = '';
  let inner = '';
  let core = '';
  for (let i = 0; i < rows; i += 1) {
    const y = baseY - height + (i / rows) * height;
    const w = width * profile[i];
    outer += rect(cx - w / 2, y, w, height / rows + 0.1, colors.outer);
    if (i >= 3) {
      const iw = w * 0.62;
      inner += rect(cx - iw / 2, y + 1, iw, height / rows, colors.inner);
    }
    if (i >= 7) {
      const cw = w * 0.30;
      core += rect(cx - cw / 2, y + 2, cw, height / rows, colors.core);
    }
  }
  const glowMarkup = glow
    ? `<ellipse cx="${n(cx)}" cy="${n(baseY - height * 0.45)}" rx="${n(width * 0.85)}" ry="${n(height * 0.72)}" fill="${colors.glow}" opacity=".22"/>`
    : '';
  return `<g class="${className}"${style ? ` style="${style}"` : ''}>${glowMarkup}${outer}${inner}${core}</g>`;
}

export function speechBubble(x, y, width, lines, options = {}) {
  const {
    fill = '#FFF4D8',
    stroke = '#16243A',
    textFill = '#16243A',
    size = 13,
    lineHeight = 16,
    tail = 'right'
  } = options;
  const height = 24 + lines.length * lineHeight;
  const tailSide = tail === 'left' ? 'left' : 'right';
  const tailX = tailSide === 'right' ? width - 32 : 20;
  const shape = [
    `M${n(x + 6)},${n(y)}`,
    `H${n(x + width - 6)}`,
    `V${n(y + 4)}`,
    `H${n(x + width - 2)}`,
    `V${n(y + height - 6)}`,
    `H${n(x + width - 6)}`,
    `V${n(y + height - 2)}`,
    `H${n(x + 30)}`,
    `L${n(x + 20)},${n(y + height + 10)}`,
    `L${n(x + 22)},${n(y + height - 2)}`,
    `H${n(x + 6)}`,
    `V${n(y + height - 6)}`,
    `H${n(x + 2)}`,
    `V${n(y + 4)}`,
    `H${n(x + 6)}`,
    'Z'
  ].join(' ');
  const textLines = lines
    .map((line, index) => text(x + width / 2, y + 19 + index * lineHeight, line, {
      size,
      fill: textFill,
      anchor: 'middle',
      weight: index === 0 ? 700 : 500,
      letter: 0.4
    }))
    .join('');
  return `<g>${pixelRoundRect(x + 2, y + 3, width, height, 3, '#0A1421', 'opacity=".25"')}<path d="${shape}" fill="${stroke}" transform="translate(2 2)"/><path d="${shape}" fill="${fill}"/>${textLines}</g>`;
}

export function cloud(x, y, scale, fill, opacity = 0.9, className = '') {
  const body = [
    rect(0, 10 * scale, 42 * scale, 8 * scale, fill, `opacity="${opacity}"`),
    rect(6 * scale, 4 * scale, 14 * scale, 8 * scale, fill, `opacity="${opacity}"`),
    rect(20 * scale, 0, 18 * scale, 12 * scale, fill, `opacity="${opacity}"`),
    rect(34 * scale, 7 * scale, 12 * scale, 7 * scale, fill, `opacity="${opacity}"`)
  ].join('');
  return `<g transform="translate(${n(x)} ${n(y)})"><g${className ? ` class="${className}"` : ''}>${body}</g></g>`;
}

export function sun(cx, cy, radius, colors, glow = true) {
  const rays = [
    [cx - radius - 16, cy - 2, 12, 4],
    [cx + radius + 4, cy - 2, 12, 4],
    [cx - 2, cy - radius - 16, 4, 12],
    [cx - 2, cy + radius + 4, 4, 12],
    [cx - radius - 10, cy - radius - 10, 8, 4],
    [cx + radius + 2, cy - radius - 10, 8, 4],
    [cx - radius - 10, cy + radius + 6, 8, 4],
    [cx + radius + 2, cy + radius + 6, 8, 4]
  ];
  return `<g>${glow ? `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(radius * 2.4)}" fill="${colors.sunLight}" opacity=".18"/>` : ''}${rays.map((ray) => rect(...ray, colors.sun, 'opacity=".7"')).join('')}${pixelCircle(cx, cy, radius, colors.sun, 2)}${rect(cx - radius * 0.4, cy - radius * 0.45, radius * 0.5, radius * 0.35, colors.sunLight, 'opacity=".65"')}</g>`;
}

export function moon(cx, cy, radius, color) {
  return `<g>${pixelCircle(cx, cy, radius, color, 2)}${pixelCircle(cx + radius * 0.55, cy - radius * 0.12, radius * 0.92, '#243A5C', 2)}${rect(cx - 4, cy + 3, 3, 2, '#D8CB9A', 'opacity=".45"')}</g>`;
}
