import copy
import random
from typing import List, Dict, Optional, Any

# Types
PlayerId = str
Phase = str

class Card:
    def __init__(self, id: str, cost: int, attack: int = 0, health: int = 0, type: str = "Unit", keywords: List[str] = None):
        self.id = id
        self.cost = cost
        self.attack = attack
        self.health = health
        self.type = type
        self.keywords = keywords or []
        self.is_barrier_active = "Barrier" in self.keywords

class PlayerState:
    def __init__(self, id: PlayerId):
        self.id = id
        self.health = 20
        self.max_health = 20
        self.mana = 1
        self.max_mana = 1
        self.hand: List[Card] = []
        self.field: List[Card] = []
        self.graveyard: List[Card] = []

class GameState:
    def __init__(self):
        self.turn = 1
        self.active_player = "player"
        self.phase = "Main"
        self.players: Dict[str, PlayerState] = {
            "player": PlayerState("player"),
            "opponent": PlayerState("opponent")
        }
        self.winner: Optional[str] = None
        self.log: List[str] = []

class PythonCoreEngine:
    def __init__(self):
        self.state = GameState()
        # Seed logic would go here

    def reset(self):
        self.state = GameState()
        # Deal initial hands (Mock)
        for pid in ["player", "opponent"]:
            for _ in range(4):
                self.state.players[pid].hand.append(self._create_mock_card())
        return self.state

    def _create_mock_card(self) -> Card:
        # Simple mock factory
        return Card(
            id=f"card_{random.randint(1000,9999)}",
            cost=random.randint(1, 8),
            attack=random.randint(1, 8),
            health=random.randint(1, 8)
        )

    def get_legal_actions(self, player_id: str) -> List[Dict[str, Any]]:
        if self.state.winner:
            return []
        
        if self.state.active_player != player_id:
            return []

        actions = []
        player = self.state.players[player_id]

        # End Turn
        actions.append({"type": "END_TURN"})

        # Play Card
        for card in player.hand:
            if card.cost <= player.mana:
                actions.append({"type": "PLAY_CARD", "card_id": card.id})

        # Attack (Simple Rule: All units can attack face)
        for card in player.field:
            actions.append({"type": "ATTACK", "card_id": card.id})

        return actions

    def apply_action(self, action: Dict[str, Any]):
        if self.state.winner:
            return

        p_id = self.state.active_player
        player = self.state.players[p_id]
        
        if action["type"] == "END_TURN":
            self._handle_end_turn()
        
        elif action["type"] == "PLAY_CARD":
            card_id = action["card_id"]
            # Find card
            card_idx = next((i for i, c in enumerate(player.hand) if c.id == card_id), -1)
            if card_idx != -1:
                card = player.hand[card_idx]
                player.mana -= card.cost
                player.hand.pop(card_idx)
                player.field.append(card)

        elif action["type"] == "ATTACK":
            card_id = action["card_id"]
            card = next((c for c in player.field if c.id == card_id), None)
            if card:
                opponent_id = "opponent" if p_id == "player" else "player"
                opponent = self.state.players[opponent_id]
                
                # Check for blockers (simple mock: first unit can block)
                blocker = next((c for c in opponent.field if c.health > 0), None)
                
                if blocker:
                    # Resolve combat with keywords
                    self._resolve_unit_combat(card, blocker, opponent_id)
                else:
                    # Direct attack
                    opponent.health -= card.attack
                    if opponent.health <= 0:
                        self.state.winner = p_id

    def _resolve_unit_combat(self, attacker: Card, blocker: Card, defender_id: str):
        attacker_dmg = attacker.attack
        blocker_dmg = blocker.attack

        # Quick Attack Logic
        if "Quick Attack" in attacker.keywords:
            if not blocker.is_barrier_active:
                blocker.health -= attacker_dmg
            else:
                blocker.is_barrier_active = False # Pop barrier
            
            # If blocker survives, it strikes back
            if blocker.health > 0:
                if not attacker.is_barrier_active:
                    attacker.health -= blocker_dmg
                else:
                    attacker.is_barrier_active = False
        else:
            # Simultaneous strike
            if not blocker.is_barrier_active:
                blocker.health -= attacker_dmg
            else:
                blocker.is_barrier_active = False
            
            if not attacker.is_barrier_active:
                attacker.health -= blocker_dmg
            else:
                attacker.is_barrier_active = False

        # Overwhelm check
        if "Overwhelm" in attacker.keywords and blocker.health < 0:
            excess = abs(blocker.health)
            self.state.players[defender_id].health -= excess
            blocker.health = 0

    def _handle_end_turn(self):
        # Switch Player
        self.state.active_player = "opponent" if self.state.active_player == "player" else "player"
        next_p = self.state.players[self.state.active_player]
        
        # Mana and Draw
        if self.state.active_player == "player":
             self.state.turn += 1
        
        cap = min(10, self.state.turn)
        next_p.max_mana = cap
        next_p.mana = cap
        
        # Draw 1
        if len(next_p.hand) < 10:
            next_p.hand.append(self._create_mock_card())
