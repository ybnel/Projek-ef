# Task: Fix Find The Pair Game Bugs

## Status
- [x] Fix infinite shuffling loop in `FindThePairGame.jsx` <!-- id: 0 -->
- [x] Fix grid size issue to display 4x4 cards (instead of 4x2) <!-- id: 1 -->
- [x] Fix unclickable cards issue (Re-opened: removed layout prop and added cursor-pointer) <!-- id: 2 -->
- [x] Change target command to a popup/modal instead of inline text <!-- id: 3 -->
- [x] Update card click logic to reveal wrong cards momentarily then flip back <!-- id: 4 -->
- [x] Restore shuffle animation by wrapping cards in layout-enabled motion div <!-- id: 5 -->
- [x] Implement 2-card selection logic: flip back if pair doesn't match target <!-- id: 6 -->

- [ ] **Puzzle Game (High Flyers)**: Implement "Missing Puzzle" game.
    - Drag and drop pieces to fill a hole in the main image.
    - Configurable hole position and puzzle pieces.

## Context
The user reported two bugs in the "Find The Pair" game:
1. The shuffling animation phase never stops (infinite loop).
2. The game grid displays only 8 cards (4x2) instead of the expected 16 cards (4x4).

## Implementation Details
- **Shuffling Loop Fix**: Separated the `useEffect` logic in `FindThePairGame.jsx` into distinct effects for each phase ('memorize', 'shuffling', 'search'). The 'shuffling' effect now correctly depends only on `phase`, avoiding re-runs when state updates occur during the animation interval.
- **Grid Size Fix**: Updated `src/data/dummyData.js` to set `pairCount: 8` for the `small_stars` level. This ensures 16 cards (8 pairs) are generated, filling the 4-column grid as a 4x4 layout.
