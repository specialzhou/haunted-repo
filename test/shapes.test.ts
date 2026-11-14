import test from "node:test";
import assert from "node:assert/strict";
import { shapePath } from "../src/ui/shapes.ts";

const kinds = ["bug", "enhancement", "other", "friendly"] as const;

test("every shape produces a finite, non-empty path", () => {
  for (const k of kinds) {
    const d = shapePath(k, 30);
    assert.ok(d.length > 10 && d.startsWith("M") && d.endsWith("Z"), k);
    assert.ok(!/NaN|Infinity/.test(d), k);
  }
});

test("the four outlines are all different from each other", () => {
  const ds = kinds.map((k) => shapePath(k, 30));
  assert.equal(new Set(ds).size, 4);
});

// Rasterize each outline (fill ignored) on a 24x24 grid and require the masks to differ clearly.
function mask(d: string, size = 24): boolean[] {
  const nums = [...d.matchAll(/-?\d+\.?\d*/g)].map((m) => Number(m[0]));
  const pts: Array<[number, number]> = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  const inside = (x: number, y: number) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const out: boolean[] = [];
  for (let gy = 0; gy < size; gy++)
    for (let gx = 0; gx < size; gx++)
      out.push(inside(((gx + 0.5) / size) * 2 * 30 - 30, ((gy + 0.5) / size) * 2 * 30 - 30));
  return out;
}

test("at 24px in one flat color, every pair of shapes differs in at least 8% of pixels", () => {
  const masks = kinds.map((k) => mask(shapePath(k, 30)));
  for (let a = 0; a < kinds.length; a++)
    for (let b = a + 1; b < kinds.length; b++) {
      const diff = masks[a].filter((v, i) => v !== masks[b][i]).length / masks[a].length;
      assert.ok(diff >= 0.08, `${kinds[a]} vs ${kinds[b]} differ only ${(diff * 100).toFixed(1)}%`);
    }
});
