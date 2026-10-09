/**
 * lib/pdf-editor/model/geometry.ts
 * Affine matrix helpers (PDF convention: [a b c d e f], row-vector form
 * x' = a*x + c*y + e, y' = b*x + d*y + f) and rect utilities.
 */
import type { Matrix, Rect, RGBColor } from "./types";

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

/** Returns m1 × m2 (apply m1 first, then m2) — PDF `cm` semantics: CTM' = M_cm × CTM. */
export function multiply(m1: Matrix, m2: Matrix): Matrix {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + b1 * c2,
    a1 * b2 + b1 * d2,
    c1 * a2 + d1 * c2,
    c1 * b2 + d1 * d2,
    e1 * a2 + f1 * c2 + e2,
    e1 * b2 + f1 * d2 + f2,
  ];
}

export function invert(m: Matrix): Matrix | null {
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-12) return null;
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

export function applyToPoint(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

export function translate(tx: number, ty: number): Matrix {
  return [1, 0, 0, 1, tx, ty];
}

export function scale(sx: number, sy: number): Matrix {
  return [sx, 0, 0, sy, 0, 0];
}

export function rotateDeg(deg: number): Matrix {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, -s, c, 0, 0];
}

/** Rotation angle (degrees, counter-clockwise in PDF space) encoded in a matrix. */
export function matrixRotation(m: Matrix): number {
  const deg = (Math.atan2(m[1], m[0]) * 180) / Math.PI;
  return Math.round(deg * 1000) / 1000;
}

export function matrixScaleX(m: Matrix): number {
  return Math.hypot(m[0], m[1]);
}

export function matrixScaleY(m: Matrix): number {
  return Math.hypot(m[2], m[3]);
}

/** Axis-aligned bbox of a set of points. */
export function boundsOfPoints(points: Array<[number, number]>): Rect {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, width: 0, height: 0 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Transform a rect by a matrix, returning the axis-aligned bounds. */
export function transformRect(m: Matrix, r: Rect): Rect {
  return boundsOfPoints([
    applyToPoint(m, r.x, r.y),
    applyToPoint(m, r.x + r.width, r.y),
    applyToPoint(m, r.x, r.y + r.height),
    applyToPoint(m, r.x + r.width, r.y + r.height),
  ]);
}

export function rectIntersection(a: Rect, b: Rect): number {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

export function rectContains(outer: Rect, inner: Rect, tolerance = 0.5): boolean {
  return (
    inner.x >= outer.x - tolerance &&
    inner.y >= outer.y - tolerance &&
    inner.x + inner.width <= outer.x + outer.width + tolerance &&
    inner.y + inner.height <= outer.y + outer.height + tolerance
  );
}

export function round(n: number, digits = 3): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function roundRect(r: Rect, digits = 3): Rect {
  return { x: round(r.x, digits), y: round(r.y, digits), width: round(r.width, digits), height: round(r.height, digits) };
}

// ── Colour helpers ──────────────────────────────────────────────────────────

export function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function rgbToHex(c: RGBColor): string {
  const h = (n: number) => clampByte(n).toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase();
}

export function hexToRgbColor(hex: string): RGBColor | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function colorsEqual(a: RGBColor | null | undefined, b: RGBColor | null | undefined, tol = 0): boolean {
  if (!a || !b) return a === b || (!a && !b);
  return Math.abs(a.r - b.r) <= tol && Math.abs(a.g - b.g) <= tol && Math.abs(a.b - b.b) <= tol;
}

/** Converts CMYK (0..1) to sRGB bytes using the naive PDF-spec conversion. */
export function cmykToRgb(c: number, m: number, y: number, k: number): RGBColor {
  return {
    r: clampByte(255 * (1 - Math.min(1, c + k))),
    g: clampByte(255 * (1 - Math.min(1, m + k))),
    b: clampByte(255 * (1 - Math.min(1, y + k))),
  };
}

export function luminance(c: RGBColor): number {
  return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
}
