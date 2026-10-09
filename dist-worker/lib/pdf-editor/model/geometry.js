"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luminance = exports.cmykToRgb = exports.colorsEqual = exports.hexToRgbColor = exports.rgbToHex = exports.clampByte = exports.roundRect = exports.round = exports.rectContains = exports.rectIntersection = exports.transformRect = exports.boundsOfPoints = exports.matrixScaleY = exports.matrixScaleX = exports.matrixRotation = exports.rotateDeg = exports.scale = exports.translate = exports.applyToPoint = exports.invert = exports.multiply = exports.IDENTITY = void 0;
exports.IDENTITY = [1, 0, 0, 1, 0, 0];
/** Returns m1 × m2 (apply m1 first, then m2) — PDF `cm` semantics: CTM' = M_cm × CTM. */
function multiply(m1, m2) {
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
exports.multiply = multiply;
function invert(m) {
    const [a, b, c, d, e, f] = m;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-12)
        return null;
    return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}
exports.invert = invert;
function applyToPoint(m, x, y) {
    return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}
exports.applyToPoint = applyToPoint;
function translate(tx, ty) {
    return [1, 0, 0, 1, tx, ty];
}
exports.translate = translate;
function scale(sx, sy) {
    return [sx, 0, 0, sy, 0, 0];
}
exports.scale = scale;
function rotateDeg(deg) {
    const r = (deg * Math.PI) / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [c, s, -s, c, 0, 0];
}
exports.rotateDeg = rotateDeg;
/** Rotation angle (degrees, counter-clockwise in PDF space) encoded in a matrix. */
function matrixRotation(m) {
    const deg = (Math.atan2(m[1], m[0]) * 180) / Math.PI;
    return Math.round(deg * 1000) / 1000;
}
exports.matrixRotation = matrixRotation;
function matrixScaleX(m) {
    return Math.hypot(m[0], m[1]);
}
exports.matrixScaleX = matrixScaleX;
function matrixScaleY(m) {
    return Math.hypot(m[2], m[3]);
}
exports.matrixScaleY = matrixScaleY;
/** Axis-aligned bbox of a set of points. */
function boundsOfPoints(points) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of points) {
        if (x < minX)
            minX = x;
        if (y < minY)
            minY = y;
        if (x > maxX)
            maxX = x;
        if (y > maxY)
            maxY = y;
    }
    if (!Number.isFinite(minX))
        return { x: 0, y: 0, width: 0, height: 0 };
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
exports.boundsOfPoints = boundsOfPoints;
/** Transform a rect by a matrix, returning the axis-aligned bounds. */
function transformRect(m, r) {
    return boundsOfPoints([
        applyToPoint(m, r.x, r.y),
        applyToPoint(m, r.x + r.width, r.y),
        applyToPoint(m, r.x, r.y + r.height),
        applyToPoint(m, r.x + r.width, r.y + r.height),
    ]);
}
exports.transformRect = transformRect;
function rectIntersection(a, b) {
    const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    return w > 0 && h > 0 ? w * h : 0;
}
exports.rectIntersection = rectIntersection;
function rectContains(outer, inner, tolerance = 0.5) {
    return (inner.x >= outer.x - tolerance &&
        inner.y >= outer.y - tolerance &&
        inner.x + inner.width <= outer.x + outer.width + tolerance &&
        inner.y + inner.height <= outer.y + outer.height + tolerance);
}
exports.rectContains = rectContains;
function round(n, digits = 3) {
    const f = 10 ** digits;
    return Math.round(n * f) / f;
}
exports.round = round;
function roundRect(r, digits = 3) {
    return { x: round(r.x, digits), y: round(r.y, digits), width: round(r.width, digits), height: round(r.height, digits) };
}
exports.roundRect = roundRect;
// ── Colour helpers ──────────────────────────────────────────────────────────
function clampByte(n) {
    return Math.max(0, Math.min(255, Math.round(n)));
}
exports.clampByte = clampByte;
function rgbToHex(c) {
    const h = (n) => clampByte(n).toString(16).padStart(2, "0");
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase();
}
exports.rgbToHex = rgbToHex;
function hexToRgbColor(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    if (!m)
        return null;
    let h = m[1];
    if (h.length === 3)
        h = h.split("").map((ch) => ch + ch).join("");
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
exports.hexToRgbColor = hexToRgbColor;
function colorsEqual(a, b, tol = 0) {
    if (!a || !b)
        return a === b || (!a && !b);
    return Math.abs(a.r - b.r) <= tol && Math.abs(a.g - b.g) <= tol && Math.abs(a.b - b.b) <= tol;
}
exports.colorsEqual = colorsEqual;
/** Converts CMYK (0..1) to sRGB bytes using the naive PDF-spec conversion. */
function cmykToRgb(c, m, y, k) {
    return {
        r: clampByte(255 * (1 - Math.min(1, c + k))),
        g: clampByte(255 * (1 - Math.min(1, m + k))),
        b: clampByte(255 * (1 - Math.min(1, y + k))),
    };
}
exports.cmykToRgb = cmykToRgb;
function luminance(c) {
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
}
exports.luminance = luminance;
