import type { MonsterKind } from "../types.ts";

// Shapes are drawn at unit scale (radius 1) around (0,0) so they stay distinct without color.
export function shapePath(kind: MonsterKind | "friendly", r: number): string {
  const p = (x: number, y: number) => `${(x * r).toFixed(1)},${(y * r).toFixed(1)}`;
  if (kind === "enhancement") {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rad = i % 2 === 0 ? 1 : 0.45;
      pts.push(p(Math.cos(a) * rad, Math.sin(a) * rad));
    }
    return "M" + pts.join("L") + "Z";
  }
  if (kind === "bug") {
    const pts: string[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI / 8) * i, rad = i % 2 === 0 ? 1 : 0.72;
      pts.push(p(Math.cos(a) * rad, Math.sin(a) * rad));
    }
    return "M" + pts.join("L") + "Z";
  }
  if (kind === "friendly") {
    // rounded swirl-ish blob
    return `M${p(0, -1)}C${p(0.9, -1)} ${p(1, -0.2)} ${p(0.7, 0.5)}C${p(0.4, 1)} ${p(-0.6, 1)} ${p(-0.9, 0.3)}C${p(-1.1, -0.5)} ${p(-0.5, -1)} ${p(0, -1)}Z`;
  }
  // other: square ghost with wavy bottom
  return `M${p(-0.9, -0.9)}H${p(0.9, -0.9)}V${p(0.5, 0.9)}L${p(0.5, 0.9)}L${p(0.3, 0.6)}L${p(0.1, 0.9)}L${p(-0.1, 0.6)}L${p(-0.3, 0.9)}L${p(-0.5, 0.6)}L${p(-0.9, 0.9)}Z`;
}

export const FILL: Record<MonsterKind, string> = { bug: "#E5384F", enhancement: "#6FB3FF", other: "#8C84A8" };
