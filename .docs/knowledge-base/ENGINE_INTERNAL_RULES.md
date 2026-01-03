# Riftbound Engine: Internal Protocol & Priority Rules

## 1. The Priority Clock
Riftbound operates on a dual-priority system. Unlike simpler TCGs, actions are gated by "Priority Windows."

### 1.1 Priority Phases
- **Active Player (AP)**: The player whose turn it is.
- **Non-Active Player (NAP)**: The opponent.

### 1.2 The Passing Rule
- If AP takes a "Slow" or "Fast" action, priority passes to NAP.
- If NAP passes without acting, the action resolves.
- If both players pass on an empty stack, the turn phase ends.

## 2. Recursive Stack Resolution (LIFO)
The stack follows a Last-In, First-Out (LIFO) order.

### 2.1 Resolution Window
1. When a spell/ability is cast, it is placed at the **Top** of the stack.
2. A priority window opens for the opponent.
3. If they respond, their action goes on top.
4. When both pass, the top-most item resolves.
5. **CRITICAL**: After *each* resolution, a new priority window opens. Players can add more items to the stack *before* the next original item resolves.

## 3. Keyword Interaction Matrix

### 3.1 Barrier vs Overwhelm
- **Rule**: Barrier negates the *damage* to the unit, but not the *calculation* for Overwhelm.
- **Logic**: `Excess Damage = Attacker Power - Defender Current HP`. If Defender has Barrier, it takes 0 damage, but the Nexus still takes `Excess Damage`.

### 3.2 Quick Attack vs Tough
- **Rule**: Quick Attack strikes first. If the defender has Tough, each strike (including the first) is reduced by 1.
- **Nuance**: If Quick Attack kills the defender, the defender does NOT strike back, effectively bypassing the Tough mitigation for the attacker.

### 3.3 Regeneration
- **Rule**: Occurs at the start of the owner's turn. 
- **Sequence**: Start Turn -> Mana Refill -> **Regeneration Trigger** -> Draw Card.

## 4. State Determinism
All engine transitions must be deterministic.
- Randomness (shuffling, random targets) must use the `StateSeed`.
- State snapshots must be bit-identical between TypeScript (Client) and Python (AI Training).
