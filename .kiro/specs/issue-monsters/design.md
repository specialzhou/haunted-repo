# Design: Issue Monsters

## Architecture
Static TypeScript single-page app. No backend. Two data sources behind one interface:
- `SnapshotSource`: bundled JSON of a real public repo's open issues (default, used for the demo video).
- `GitHubSource`: `GET https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=100`, public and unauthenticated. MCP (GitHub server) is used during development to collect the snapshot.

## Modules
- `src/types.ts`: `RawIssue`, `Issue` (number, title, labels, createdAt, url), `Monster`.
- `src/sanitize.ts`: `sanitize(raw[]) -> Issue[]`. Drops PRs and every field not listed in requirement 3.
- `src/monsters.ts`: pure `toMonster(issue, now) -> Monster` with `size` (1-5 by age bands), `beginnerFriendly`, `kind` (chosen by labels, e.g. bug, feature, docs, other).
- `src/sources.ts`: the two sources.
- `src/ui/`: house scene, monster sprites, detail panel. Visual style from Iris.

## Mapping rules
Age in days: <30 -> 1, <90 -> 2, <180 -> 3, <365 -> 4, otherwise 5.
Kind: first matching label among bug, enhancement/feature, documentation; otherwise `ghost`.

## Correctness properties (property-based tests, fast-check)
P1. Monotonic size: for equal labels, an older issue never gets a smaller size.
P2. Size is always in 1..5.
P3. Sanitize is idempotent and its output has only the allowed keys.
P4. Sanitize never returns an item that was a pull request.
P5. `beginnerFriendly` is true if and only if a beginner label is present (case-insensitive).
P6. `toMonster` is deterministic for the same input.

## Kiro usage to record in docs/how-we-used-kiro.md
spec (this folder), hooks (test on save, doc update), steering, MCP (GitHub server for the snapshot), custom agent (a "monster-mapper reviewer" for the mapping rules), property-based tests (P1 to P6).

## Visual design (from Iris)
Tone: eerie but cute, never gory. Priority until 12/2: readability and polish first. Sound and volume mapping come last and are cut first if time runs out. Any sound must be royalty-free or self-generated.

Palette (CSS variables in `src/ui/theme.css`):
- background #0E0B14, panel #1B1626, text #EDE7F6
- ghost green #7CFFB2 (clickable, friendly), pumpkin orange #FF8A1F (primary button, "exorcise"), blood red #E5384F (oldest, most severe), ghost blue #6FB3FF (neutral info tags)

Monster color by label: bug = red, enhancement = blue, other = grey-purple. Beginner-friendly ("friendly ghost") = green, semi-transparent, smiling face. Color never carries information alone: each label kind also gets its own shape or icon, so it stays readable after video compression.

Typography: a Halloween display font for titles only (self-hosted, license checked). Body and issue panel use the default sans-serif.
Motion: only on hover and on the "exorcise" click.

### Label shapes (final, agreed with Iris)
- bug: spiked circle
- enhancement: star
- other: square ghost
- friendly ghost (beginner-friendly): swirl with a smiley face

Rule: the four outlines must stay distinct from each other at icon size and must not depend on fill color. Add a test or visual check that renders each shape in one flat color at 24px and confirms they are still told apart.

### Decisions on open items
- Oldest monsters: fill color always follows the label (bug red, enhancement blue, other grey-purple). The 5 oldest open issues get the largest size plus a blood-red glow ring around the outline. The glow never changes the fill, so a red glow on a blue star is not read as a bug.
- Issue panel fields: number, title, labels, age, link. No comment count, because it is not in the allowed field list in requirement 3. The script should not mention comment count.
- The "friendly ghost" filter toggles without animation. The only animations are hover and the exorcise click.

### Glow ring (from Iris)
The oldest-issue glow is a soft outer halo, not a red outline stroke. A stroke would read as the same thing as a red bug fill. Check: render the oldest bug and the oldest enhancement, compress the screenshots, and confirm "oldest" and "is a bug" are still told apart.
