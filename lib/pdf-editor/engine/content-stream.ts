/**
 * lib/pdf-editor/engine/content-stream.ts
 *
 * Dedicated PDF Content Stream tokenizer, AST parser, and compiler.
 * Supports standard PDF operators per ISO 32000-1 (Chapter 9: Text, Chapter 8: Graphics).
 *
 * Features:
 *   - FlateDecode + ASCII85Decode decompression & FlateDecode compression.
 *   - Parses stream into a list of typed Operation tokens with their operands.
 *   - Tracks operator start/end offsets.
 *   - Compiles AST back to compliant PDF bytes.
 */

import zlib from "node:zlib";

export type Operand =
  | number
  | string
  | boolean
  | null
  | Operand[]
  | { name: string }
  | { raw: Uint8Array };

export interface ContentOp {
  /** PDF operator mnemonic, e.g. "BT", "ET", "Tf", "Tj", "TJ", "Tm", "cm", "rg", "re", "Do" */
  op: string;
  operands: Operand[];
}

// ── Stream Decompression / Compression ──────────────────────────────────────

/** Decodes ASCII85 / btoa encoding used in ReportLab and other PDF producers. */
export function decodeAscii85(input: Uint8Array | string): Uint8Array {
  let str = typeof input === "string" ? input : new TextDecoder("ascii").decode(input);
  str = str.replace(/\s+/g, "");
  if (str.startsWith("<~")) str = str.slice(2);
  if (str.endsWith("~>")) str = str.slice(0, -2);

  const out: number[] = [];
  let tuple = 0;
  let count = 0;

  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c === 122) { // 'z' stands for 4 zero bytes
      if (count !== 0) throw new Error("Unexpected 'z' inside ASCII85 5-tuple");
      out.push(0, 0, 0, 0);
      continue;
    }
    if (c < 33 || c > 117) continue; // ignore non-ASCII85 characters
    tuple = tuple * 85 + (c - 33);
    count++;
    if (count === 5) {
      out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255);
      tuple = 0;
      count = 0;
    }
  }

  if (count > 0) {
    for (let i = count; i < 5; i++) {
      tuple = tuple * 85 + 84;
    }
    for (let i = 0; i < count - 1; i++) {
      out.push((tuple >>> (24 - i * 8)) & 255);
    }
  }

  return new Uint8Array(out);
}

/** Decompresses a content stream given its filter names. */
export function decompressContentStream(
  rawBytes: Uint8Array,
  filters: string[] = []
): Uint8Array {
  let current: Uint8Array = rawBytes;

  // Filters are applied in order of encoding, so we decode in reverse or specified order.
  for (const filter of filters) {
    const f = filter.replace(/^\//, "");
    if (f === "ASCII85Decode" || f === "A85") {
      current = decodeAscii85(current);
    } else if (f === "FlateDecode" || f === "Fl") {
      try {
        current = new Uint8Array(zlib.inflateSync(current));
      } catch {
        // Some PDF streams omit zlib headers or use raw deflate
        current = new Uint8Array(zlib.inflateRawSync(current));
      }
    }
  }

  return current;
}

/** Compresses a content stream using standard FlateDecode (zlib deflate). */
export function compressContentStream(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(zlib.deflateSync(bytes, { level: 9 }));
}

// ── Content Stream Tokenizer ────────────────────────────────────────────────

export function tokenizeContentStream(content: Uint8Array | string): ContentOp[] {
  const text = typeof content === "string" ? content : new TextDecoder("latin1").decode(content);
  const len = text.length;
  let pos = 0;

  const ops: ContentOp[] = [];
  let currentOperands: Operand[] = [];

  const isWhitespace = (ch: string) => ch === " " || ch === "\t" || ch === "\r" || ch === "\n" || ch === "\f" || ch === "\0";
  const isDelimiter = (ch: string) => ch === "(" || ch === ")" || ch === "<" || ch === ">" || ch === "[" || ch === "]" || ch === "{" || ch === "}" || ch === "/" || ch === "%";

  function skipWhitespaceAndComments() {
    while (pos < len) {
      const ch = text[pos];
      if (isWhitespace(ch)) {
        pos++;
      } else if (ch === "%") {
        // Comment until newline
        while (pos < len && text[pos] !== "\r" && text[pos] !== "\n") pos++;
      } else {
        break;
      }
    }
  }

  function readStringLiteral(): string {
    pos++; // skip '('
    let depth = 1;
    let str = "";
    while (pos < len && depth > 0) {
      const ch = text[pos];
      if (ch === "\\") {
        pos++;
        if (pos >= len) break;
        const esc = text[pos];
        if (esc === "n") str += "\n";
        else if (esc === "r") str += "\r";
        else if (esc === "t") str += "\t";
        else if (esc === "b") str += "\b";
        else if (esc === "f") str += "\f";
        else if (esc === "(" || esc === ")" || esc === "\\") str += esc;
        else if (esc >= "0" && esc <= "7") {
          // Octal escape \ddd
          let oct = esc;
          if (pos + 1 < len && text[pos + 1] >= "0" && text[pos + 1] <= "7") {
            pos++;
            oct += text[pos];
            if (pos + 1 < len && text[pos + 1] >= "0" && text[pos + 1] <= "7") {
              pos++;
              oct += text[pos];
            }
          }
          str += String.fromCharCode(parseInt(oct, 8));
        } else if (esc === "\r" || esc === "\n") {
          // Line continuation
          if (esc === "\r" && pos + 1 < len && text[pos + 1] === "\n") pos++;
        } else {
          str += esc;
        }
        pos++;
      } else if (ch === "(") {
        depth++;
        str += ch;
        pos++;
      } else if (ch === ")") {
        depth--;
        if (depth > 0) str += ch;
        pos++;
      } else {
        str += ch;
        pos++;
      }
    }
    return str;
  }

  function readHexString(): string {
    pos++; // skip '<'
    let hex = "";
    while (pos < len && text[pos] !== ">") {
      const ch = text[pos];
      if (!isWhitespace(ch)) hex += ch;
      pos++;
    }
    if (pos < len && text[pos] === ">") pos++;
    if (hex.length % 2 !== 0) hex += "0";
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
    }
    return str;
  }

  function readName(): { name: string } {
    pos++; // skip '/'
    let name = "";
    while (pos < len && !isWhitespace(text[pos]) && !isDelimiter(text[pos])) {
      if (text[pos] === "#" && pos + 2 < len) {
        const hex = text.slice(pos + 1, pos + 3);
        name += String.fromCharCode(parseInt(hex, 16));
        pos += 3;
      } else {
        name += text[pos];
        pos++;
      }
    }
    return { name };
  }

  function readArray(): Operand[] {
    pos++; // skip '['
    const arr: Operand[] = [];
    while (pos < len) {
      skipWhitespaceAndComments();
      if (pos >= len || text[pos] === "]") {
        if (pos < len) pos++; // skip ']'
        break;
      }
      arr.push(readNextToken());
    }
    return arr;
  }

  function readNextToken(): Operand {
    skipWhitespaceAndComments();
    if (pos >= len) return null;
    const ch = text[pos];

    if (ch === "(") return readStringLiteral();
    if (ch === "<") {
      if (pos + 1 < len && text[pos + 1] === "<") {
        // Dict start << (rare in content streams, e.g. inline image or marked content)
        pos += 2;
        return { name: "<<" };
      }
      return readHexString();
    }
    if (ch === ">" && pos + 1 < len && text[pos + 1] === ">") {
      pos += 2;
      return { name: ">>" };
    }
    if (ch === "/") return readName();
    if (ch === "[") return readArray();

    // Bare word / number / operator
    let word = "";
    while (pos < len && !isWhitespace(text[pos]) && !isDelimiter(text[pos])) {
      word += text[pos];
      pos++;
    }

    if (word === "") {
      // Stray delimiter character like '>', ']', '}', etc.
      const stray = text[pos];
      pos++;
      return stray;
    }

    if (word === "true") return true;
    if (word === "false") return false;
    if (word === "null") return null;

    const num = Number(word);
    if (!Number.isNaN(num) && word.trim() !== "") {
      return num;
    }

    return word;
  }

  // Known PDF operators set
  const KNOWN_OPS = new Set([
    "b", "B", "b*", "B*", "BDC", "BI", "BMC", "BT", "BX", "c", "cm", "CS", "cs",
    "d", "d0", "d1", "Do", "DP", "EI", "EMC", "ET", "EX", "f", "F", "f*", "G",
    "g", "gs", "h", "i", "ID", "j", "J", "K", "k", "l", "m", "M", "MP", "n",
    "q", "Q", "re", "RG", "rg", "ri", "s", "S", "sc", "SC", "scn", "SCN", "sh",
    "T*", "Tc", "Td", "TD", "Tf", "Tj", "TJ", "TL", "Tm", "Tr", "Ts", "Tw", "Tz",
    "v", "w", "W", "W*", "y", "'", "\"",
  ]);

  while (pos < len) {
    skipWhitespaceAndComments();
    if (pos >= len) break;

    const startPos = pos;
    const token = readNextToken();
    if (token === null && pos >= len) break;
    if (pos === startPos) pos++;

    if (typeof token === "string" && KNOWN_OPS.has(token)) {
      // It's an operator!
      ops.push({ op: token, operands: currentOperands });
      currentOperands = [];
    } else {
      currentOperands.push(token);
    }
  }

  return ops;
}

// ── Content Stream Serializer ───────────────────────────────────────────────

function escapePdfString(str: string): string {
  let res = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const code = str.charCodeAt(i);
    if (c === "(" || c === ")" || c === "\\") {
      res += "\\" + c;
    } else if (c === "\r") {
      res += "\\r";
    } else if (c === "\n") {
      res += "\\n";
    } else if (c === "\t") {
      res += "\\t";
    } else if (code < 32 || code > 126) {
      // Octal escape for non-ASCII or high chars in WinAnsi
      res += "\\" + code.toString(8).padStart(3, "0");
    } else {
      res += c;
    }
  }
  return `(${res})`;
}

function serializeOperand(operand: Operand): string {
  if (typeof operand === "number") {
    // Format numbers cleanly without scientific notation, max 5 decimals
    if (Number.isInteger(operand)) return String(operand);
    const s = operand.toFixed(5);
    return s.replace(/\.?0+$/, "");
  }
  if (typeof operand === "string") {
    return escapePdfString(operand);
  }
  if (typeof operand === "boolean") {
    return operand ? "true" : "false";
  }
  if (operand === null) {
    return "null";
  }
  if (Array.isArray(operand)) {
    return `[${operand.map(serializeOperand).join(" ")}]`;
  }
  if (typeof operand === "object" && "name" in operand) {
    return `/${operand.name}`;
  }
  return "";
}

export function serializeContentStream(ops: ContentOp[]): Uint8Array {
  const chunks: string[] = [];
  for (const op of ops) {
    if (op.operands.length > 0) {
      const opsStr = op.operands.map(serializeOperand).join(" ");
      chunks.push(`${opsStr} ${op.op}\n`);
    } else {
      chunks.push(`${op.op}\n`);
    }
  }
  return new TextEncoder().encode(chunks.join(""));
}
