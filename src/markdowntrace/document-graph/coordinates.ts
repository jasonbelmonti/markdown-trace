import type { SourcePosition, SourceRange } from "./contracts/source.js";

export class Coordinates {
  private starts?: number[];
  constructor(readonly text: string) {}

  // Only Trace-created substrings and expanded fragments need offset conversion.
  private lineStarts(): number[] {
    if (this.starts) return this.starts;
    const starts = [0],
      text = this.text;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\r") {
        if (text[i + 1] === "\n") i++;
        starts.push(i + 1);
      } else if (text[i] === "\n") starts.push(i + 1);
    }
    this.starts = starts;
    return starts;
  }
  position(offset: number): SourcePosition {
    const starts = this.lineStarts();
    let low = 0,
      high = starts.length;
    while (low + 1 < high) {
      const mid = (low + high) >>> 1;
      if (starts[mid] <= offset) low = mid;
      else high = mid;
    }
    return { offset, line: low + 1, column: offset - starts[low] + 1 };
  }
  range(start: number, end: number): SourceRange {
    return { start: this.position(start), end: this.position(end) };
  }
}
