export function groupBy(items, keyForItem) {
  const groups = new Map();

  for (const item of items) {
    const key = keyForItem(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return groups;
}

export function numberedId(prefix, number) {
  return `${prefix}-${String(number).padStart(4, "0")}`;
}

export function sortByOccurrence(items) {
  return [...items].sort(
    (left, right) =>
      (left.sourceRange?.start?.offset ?? Number.MAX_SAFE_INTEGER) -
        (right.sourceRange?.start?.offset ?? Number.MAX_SAFE_INTEGER) ||
      left.label.localeCompare(right.label),
  );
}

export function sortByRangeStart(items) {
  return [...items].sort((left, right) => rangeStart(left) - rangeStart(right));
}

export function unique(items) {
  return [...new Set(items)];
}

function rangeStart(item) {
  return item.sourceRange?.start?.offset ?? item.target?.sourceRange?.start?.offset ?? Number.MAX_SAFE_INTEGER;
}
