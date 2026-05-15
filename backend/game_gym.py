import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
import logging

from game_logic import PythonCoreEngine
from vectorizer import StateVectorizer

logger = logging.getLogger("RiftboundEnv")


class RiftboundEnv(gym.Env):
    """
    Gymnasium interface for Riftbound Simulator TCG.

    Connects to PythonCoreEngine for real game simulation with:
    - Action masking: only legal moves are available to the agent.
    - Reward shaping: damage dealt, card advantage, win/loss.
    - Opponent policy: random legal actions (self-play ready).

    Observation Space:
        Box(low=0, high=1, shape=(256,), dtype=float32)
    Action Space:
        Discrete(50) — indices into the legal actions list, padded with NO-OPs.
    """

    metadata = {"render_modes": ["human", "rgb_array"], "render_fps": 4}

    # --- Constants ---
    INPUT_DIM = 256
    ACTION_DIM = 50
    MAX_STEPS_PER_EPISODE = 200

    # --- Reward Weights ---
    REWARD_WIN = 10.0
    REWARD_LOSS = -10.0
    REWARD_DAMAGE_DEALT = 0.3
    REWARD_DAMAGE_TAKEN = -0.2
    REWARD_CARD_PLAYED = 0.1
    REWARD_STEP_PENALTY = -0.01  # Small penalty per step to encourage faster wins

    def __init__(self, render_mode=None):
        super().__init__()

        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(self.INPUT_DIM,), dtype=np.float32
        )
        self.action_space = spaces.Discrete(self.ACTION_DIM)

        self.render_mode = render_mode

        # Internal state
        self.engine: PythonCoreEngine | None = None
        self.vectorizer = StateVectorizer(vector_dim=self.INPUT_DIM)
        self.legal_actions: list[dict] = []
        self.current_step = 0
        self._prev_player_health = 20
        self._prev_opponent_health = 20

    # ------------------------------------------------------------------
    # Gymnasium API
    # ------------------------------------------------------------------

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)

        # Create a fresh game engine and deal initial hands
        self.engine = PythonCoreEngine()
        self.engine.reset()

        self.current_step = 0
        self._prev_player_health = self.engine.state.players["player"].health
        self._prev_opponent_health = self.engine.state.players["opponent"].health

        # Cache legal actions for the agent
        self.legal_actions = self.engine.get_legal_actions("player")

        observation = self._get_observation()
        info = {"legal_actions": len(self.legal_actions)}
        return observation, info

    def step(self, action: int):
        assert self.engine is not None, "Call reset() before step()"
        self.current_step += 1

        reward = self.REWARD_STEP_PENALTY
        terminated = False
        truncated = False

        # --- Agent's Turn (player) ---
        if self.engine.state.active_player == "player" and not self.engine.state.winner:
            chosen = self._resolve_action(action)
            reward += self._calculate_pre_action_reward(chosen)
            self.engine.apply_action(chosen)
            reward += self._calculate_post_action_reward()

        # --- Opponent's Turn (random policy until self-play) ---
        while (
            self.engine.state.active_player == "opponent"
            and not self.engine.state.winner
        ):
            opp_actions = self.engine.get_legal_actions("opponent")
            if not opp_actions:
                break
            opp_choice = random.choice(opp_actions)
            self.engine.apply_action(opp_choice)

        # --- Check termination ---
        if self.engine.state.winner:
            terminated = True
            if self.engine.state.winner == "player":
                reward += self.REWARD_WIN
            else:
                reward += self.REWARD_LOSS

        # --- Truncation (prevent infinite games) ---
        if self.current_step >= self.MAX_STEPS_PER_EPISODE:
            truncated = True

        # --- Refresh legal actions for next step ---
        self.legal_actions = self.engine.get_legal_actions("player")

        # Update health trackers
        self._prev_player_health = self.engine.state.players["player"].health
        self._prev_opponent_health = self.engine.state.players["opponent"].health

        observation = self._get_observation()
        info = {
            "turn": self.engine.state.turn,
            "legal_actions": len(self.legal_actions),
            "winner": self.engine.state.winner,
        }

        return observation, reward, terminated, truncated, info

    def action_masks(self) -> np.ndarray:
        """
        Returns a boolean mask of shape (ACTION_DIM,).
        True = legal action, False = illegal (will be masked by SB3).
        Compatible with sb3-contrib MaskablePPO.
        """
        mask = np.zeros(self.ACTION_DIM, dtype=bool)
        n_legal = min(len(self.legal_actions), self.ACTION_DIM)
        mask[:n_legal] = True
        return mask

    def render(self):
        if self.render_mode == "human" and self.engine:
            state = self.engine.state
            p = state.players["player"]
            o = state.players["opponent"]
            print(
                f"Turn {state.turn} | Phase: {state.phase} | "
                f"Player: {p.health}HP {p.mana}M ({len(p.field)} units) | "
                f"Opponent: {o.health}HP ({len(o.field)} units)"
            )

    def close(self):
        self.engine = None

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_observation(self) -> np.ndarray:
        """Serialize engine state into a fixed-size vector."""
        if self.engine is None:
            return np.zeros(self.INPUT_DIM, dtype=np.float32)

        state_dict = self._engine_state_to_dict()
        return self.vectorizer.vectorize(state_dict)

    def _resolve_action(self, action_idx: int) -> dict:
        """Map a discrete action index to a legal game action."""
        if not self.legal_actions:
            return {"type": "END_TURN"}

        # Clamp to legal range
        idx = min(action_idx, len(self.legal_actions) - 1)
        idx = max(idx, 0)
        return self.legal_actions[idx]

    def _calculate_pre_action_reward(self, action: dict) -> float:
        """Reward shaping based on the action chosen (before applying)."""
        reward = 0.0
        if action["type"] == "PLAY_CARD":
            reward += self.REWARD_CARD_PLAYED
        return reward

    def _calculate_post_action_reward(self) -> float:
        """Reward shaping based on state changes after action."""
        reward = 0.0
        p = self.engine.state.players["player"]
        o = self.engine.state.players["opponent"]

        # Reward for dealing damage to opponent
        opp_dmg = self._prev_opponent_health - o.health
        if opp_dmg > 0:
            reward += opp_dmg * self.REWARD_DAMAGE_DEALT

        # Penalty for taking damage
        player_dmg = self._prev_player_health - p.health
        if player_dmg > 0:
            reward += player_dmg * self.REWARD_DAMAGE_TAKEN

        return reward

    def _engine_state_to_dict(self) -> dict:
        """Convert PythonCoreEngine state to the dict format expected by StateVectorizer."""
        state = self.engine.state
        result = {
            "turn": state.turn,
            "activePlayer": state.active_player,
            "priority": state.active_player,
            "phase": state.phase,
            "players": {},
        }
        for pid in ["player", "opponent"]:
            ps = state.players[pid]
            result["players"][pid] = {
                "health": ps.health,
                "maxHealth": ps.max_health,
                "mana": ps.mana,
                "maxMana": ps.max_mana,
                "deckCount": 0,
                "hand": [
                    {
                        "id": c.id,
                        "cost": c.cost,
                        "attack": c.attack,
                        "health": c.health,
                        "keywords": c.keywords,
                    }
                    for c in ps.hand
                ],
                "field": [
                    {
                        "id": c.id,
                        "attack": c.attack,
                        "health": c.health,
                        "keywords": c.keywords,
                    }
                    for c in ps.field
                ],
                "graveyard": [],
            }
        return result
