import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const corpusUrl = new URL('../../examples/corpus/', import.meta.url);
export const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const keyBy = (items, key = 'id') => {
  assert(Array.isArray(items), 'Expected an array');
  const entries = items.map(item => [item[key], item]);
  assert(entries.every(([id]) => typeof id === 'string' && id.length), `Missing ${key}`);
  const map = new Map(entries);
  assert.equal(map.size, entries.length, `Duplicate ${key}`);
  return map;
};
export const position = (text, offset) => {
  const prefix = text.slice(0, offset);
  return { offset, line: prefix.split('\n').length, column: offset - prefix.lastIndexOf('\n') };
};
export const rangeAt = (text, start, end) => ({ start: position(text, start), end: position(text, end) });
export function checkRange(text, range, spelling) {
  const { start, end } = range;
  assert(Number.isSafeInteger(start.offset) && start.offset >= 0);
  assert(Number.isSafeInteger(end.offset) && end.offset > start.offset && end.offset <= text.length);
  assert.deepEqual(start, position(text, start.offset));
  assert.deepEqual(end, position(text, end.offset));
  if (spelling !== undefined) assert.equal(text.slice(start.offset, end.offset), spelling);
}
export const compareRange = (a, b) => a.range.start.offset - b.range.start.offset || a.range.end.offset - b.range.end.offset;
export function sourceInput(annotation, root = corpusUrl) {
  const url = new URL(annotation.source.file, root);
  const bytes = readFileSync(url), text = bytes.toString('utf8');
  assert.equal(sha256(bytes), annotation.source.sha256, fileURLToPath(url));
  assert.equal(Buffer.compare(bytes, Buffer.from(text)), 0, 'Source must decode as UTF-8 without loss');
  if (annotation.source.utf8Bytes !== undefined) assert.equal(bytes.length, annotation.source.utf8Bytes);
  if (annotation.source.utf16Length !== undefined) assert.equal(text.length, annotation.source.utf16Length);
  return text;
}
