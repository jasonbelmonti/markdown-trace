import type { SourcePosition, SourceRange } from "./contracts/source.js";

export class Coordinates {
  private readonly starts = [0];
  constructor(readonly text: string) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\r") {
        if (text[i + 1] === "\n") i++;
        this.starts.push(i + 1);
      } else if (text[i] === "\n") this.starts.push(i + 1);
    }
  }
  position(offset: number): SourcePosition {
    let low = 0,
      high = this.starts.length;
    while (low + 1 < high) {
      const mid = (low + high) >>> 1;
      if (this.starts[mid] <= offset) low = mid;
      else high = mid;
    }
    return { offset, line: low + 1, column: offset - this.starts[low] + 1 };
  }
  range(start: number, end: number): SourceRange {
    return { start: this.position(start), end: this.position(end) };
  }
}
