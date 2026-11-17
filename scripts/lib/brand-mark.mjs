/**
 * Cores e geometria da marca do EliasNote.
 *
 * O instalador usa o gradiente e as formas auxiliares deste módulo. Os ícones
 * do app e a marca na interface usam as máscaras raster em `src/assets/brand`
 * (geradas a partir de `public/logoNova.png`).
 */

export const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);

export function sdEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return (Math.hypot(dx, dy) - 1) * Math.min(rx, ry);
}

/** Distância com sinal para polígono simples (qualquer ordem de vértices). */
export function sdPolygon(x, y, points) {
  let distance = (x - points[0][0]) ** 2 + (y - points[0][1]) ** 2;
  let sign = 1;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [ix, iy] = points[i];
    const [jx, jy] = points[j];
    const ex = jx - ix;
    const ey = jy - iy;
    const wx = x - ix;
    const wy = y - iy;
    const h = clamp01((wx * ex + wy * ey) / (ex * ex + ey * ey));
    const bx = wx - ex * h;
    const by = wy - ey * h;
    distance = Math.min(distance, bx * bx + by * by);
    const upward = y >= iy;
    const downward = y < jy;
    const crossed = ex * wy > ey * wx;
    if ((upward && downward && crossed) || (!upward && !downward && !crossed)) sign = -sign;
  }
  return sign * Math.sqrt(distance);
}

/** Quadrilátero afunilado entre dois pontos (pena da pena de escrever). */
export function taper(from, to, halfFrom, halfTo) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  const px = -dy / length;
  const py = dx / length;
  return [
    [from[0] + px * halfFrom, from[1] + py * halfFrom],
    [to[0] + px * halfTo, to[1] + py * halfTo],
    [to[0] - px * halfTo, to[1] - py * halfTo],
    [from[0] - px * halfFrom, from[1] - py * halfFrom],
  ];
}

// Cabeça do goblin.
const HEAD = [0.5, 0.392, 0.156, 0.15];
const EAR_LEFT = [
  [0.112, 0.212],
  [0.372, 0.328],
  [0.372, 0.456],
];
const EAR_RIGHT = EAR_LEFT.map(([x, y]) => [1 - x, y]);

// Olhos vazados (mostram o fundo observado).
const EYE_LEFT = [0.427, 0.398, 0.037, 0.047];
const EYE_RIGHT = [0.573, 0.398, 0.037, 0.047];

// Livro aberto, com a lombada no centro.
const BOOK_LEFT = [
  [0.104, 0.548],
  [0.5, 0.628],
  [0.5, 0.856],
  [0.104, 0.778],
];
const BOOK_RIGHT = BOOK_LEFT.map(([x, y]) => [1 - x, y]);

// Pena de escrever apoiada na página direita.
const QUILL_SHAFT = taper([0.664, 0.664], [0.798, 0.452], 0.012, 0.05);
const QUILL_TIP = taper([0.798, 0.452], [0.872, 0.352], 0.05, 0.004);

export function markDistance(x, y) {
  const head = Math.min(
    sdEllipse(x, y, ...HEAD),
    sdPolygon(x, y, EAR_LEFT),
    sdPolygon(x, y, EAR_RIGHT),
  );
  const body = Math.min(
    head,
    sdPolygon(x, y, BOOK_LEFT),
    sdPolygon(x, y, BOOK_RIGHT),
    sdPolygon(x, y, QUILL_SHAFT),
    sdPolygon(x, y, QUILL_TIP),
  );
  const eyes = Math.min(sdEllipse(x, y, ...EYE_LEFT), sdEllipse(x, y, ...EYE_RIGHT));
  return Math.max(body, -eyes);
}

export function sdRoundedFrame(x, y, radius) {
  const qx = Math.abs(x - 0.5) - (0.5 - radius);
  const qy = Math.abs(y - 0.5) - (0.5 - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

/** Converte distância com sinal em cobertura de ~1px de anti-aliasing. */
export const coverage = (distance, pixel) => clamp01(0.5 - distance / pixel);

/* ------------------------------------------------------------------ *
 * Cores da marca (mesmo gradiente diagonal do ícone do app).
 * ------------------------------------------------------------------ */

export const BRAND_GRADIENT_START = [124, 92, 255];
export const BRAND_GRADIENT_END = [66, 52, 214];

/** Gradiente diagonal da marca: `t` de 0 (canto superior esquerdo) a 1. */
export function brandGradient(t) {
  const factor = clamp01(t);
  return BRAND_GRADIENT_START.map((channel, index) =>
    Math.round(channel + (BRAND_GRADIENT_END[index] - channel) * factor),
  );
}

/** Fator diagonal usado pelo ícone (e por qualquer arte da marca). */
export const diagonalFactor = (nx, ny) => clamp01((nx + ny) / 1.6);

/**
 * Desenha a marca em um buffer RGBA (source-over) dentro de um quadrado.
 * `left`/`top` em pixels; `size` é o lado do quadrado; `color` é [r, g, b].
 */
export function paintMark(rgba, width, { left, top, size, color, alpha = 1 }) {
  const pixel = 1 / size;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const ink = coverage(markDistance((x + 0.5) / size, (y + 0.5) / size), pixel) * alpha;
      if (ink <= 0) continue;
      const offset = ((top + y) * width + (left + x)) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        rgba[offset + channel] = Math.round(
          rgba[offset + channel] * (1 - ink) + color[channel] * ink,
        );
      }
      rgba[offset + 3] = Math.round(Math.min(255, rgba[offset + 3] + 255 * ink));
    }
  }
}
