# Bug Analysis for Trunfo

## Bug (a): Locked Slots with Repeated Overwrites

**Current Behavior**: The code locks the "last 2 unique slots" from moveHistory.

**Investigation**: When the same slot is played multiple times, the code correctly handles it by only adding unique slots:

```javascript
const unique = [];
for (let i = this.moveHistory.length - 1; i >= 0 && unique.length < 2; i--) {
  const idx = this.moveHistory[i];
  if (!unique.includes(idx)) unique.unshift(idx);
}
this.lockedSlots = unique;
```

**Issue**: If a player plays the same slot twice in a row (moves: [0,1,2,3,4,0,0]), the locked slots will be [0, 4] (last 2 unique). But if the intent is to lock "the slots of the last 2 moves", then playing the same slot twice should only lock that one slot plus the previous unique slot.

**Decision**: The current behavior is sensible - always lock 2 different slots. The alternative (locking the same slot if played twice) would reduce protection. Document this as intended behavior.

**Status**: No code change needed, behavior is sensible. Added documentation.

## Bug (b): Alternate5 Mission

**Investigation**: Checking the `alternate5` validator:

```javascript
if (mission.type === "alternate5") {
  if (cards.length < 5) return false;
  if (board.length !== 5 || board.some((c) => !c)) return false;
  const colors = board.map((c) => c.color);
  const alt1 = colors.every((c, i) => i === 0 || c !== colors[i - 1]);
  return alt1;
}
```

**Status**: ✅ Correctly uses `board.map` which preserves slot order 0-4. No bug found.

## Bug (c): Initial Mission Exclusion

**Investigation**: The code excludes mission *types* between players:

```javascript
other.missions.forEach((m) => {
  const diff = m.difficulty || ...;
  if (!exclude[diff].includes(m.type)) exclude[diff].push(m.type);
});
```

Then uses `getRandomMissionByDifficultyExcluding(difficulty, exclude[difficulty])` which filters by type.

**Issue**: ❌ **REAL BUG** - This only excludes identical *types*, not identical *missions*. However, since all missions of the same type are identical in this game (same points, description), excluding by type IS sufficient. Checking the mission list confirms each type appears only once per difficulty.

**Status**: ✅ No bug - excluding by type is correct for this game.

## Bug (d): Mission Replacement Loop

**Investigation**: The code has a do-while loop:

```javascript
let newMission;
do {
  newMission = {
    ...getNewMissionOfSameDifficulty(completedMission),
    completed: false,
  };
} while (checkMissionCompleted(this.board, newMission));
```

**Issue**: ❌ **POTENTIAL BUG** - If the board satisfies ALL missions of a difficulty (rare but possible), this COULD loop forever.

**Fix Needed**: Add a safety counter to prevent infinite loops.

## Additional Bug Found: drawCard Inconsistency

**Issue**: ✅ **FIXED** - `drawCard(deck)` parameter was inconsistent with usage.

**Fix Applied**: Removed parameter, method now uses `this.deck` consistently.
