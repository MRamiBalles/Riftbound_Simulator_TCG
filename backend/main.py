from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
import logging
import threading
from agent import agent
from vectorizer import vectorizer
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RiftboundNeural")

app = FastAPI(title="Riftbound Neural Nexus", version="1.0.0")

@app.on_event("startup")
def startup_event():
    logger.info("Initializing Neural Agent...")
    agent.initialize()

# --- Pydantic Models Matching SerializedGameState ---

class RuntimeCardModel(BaseModel):
    id: str
    instanceId: str
    ownerId: str
    name: str
    cost: int
    baseCost: int
    attack: int
    baseAttack: int
    health: int
    baseHealth: int
    type: str
    rarity: str
    # Flexible for additional props
    keywords: List[str] = []
    
class PlayerStateModel(BaseModel):
    id: str
    health: int
    maxHealth: int
    mana: int
    maxMana: int
    hand: List[RuntimeCardModel]
    deckCount: int
    field: List[RuntimeCardModel]
    graveyard: List[RuntimeCardModel]

class CombatStateModel(BaseModel):
    attackers: Dict[str, str]
    blockers: Dict[str, str]
    isCombatPhase: bool
    step: str

class GameStateModel(BaseModel):
    turn: int
    activePlayer: str
    priority: str
    phase: str
    players: Dict[str, PlayerStateModel]
    winner: Optional[str] = None
    stack: List[Any]
    log: List[str]
    combat: Optional[CombatStateModel] = None
    seed: Optional[int] = None
    actionHistory: Optional[List[Any]] = None

class ActionModel(BaseModel):
    type: str
    playerId: str
    cardId: Optional[str] = None
    targetId: Optional[str] = None
    attackers: Optional[List[str]] = None
    blockers: Optional[Dict[str, str]] = None
    mulliganCards: Optional[List[str]] = None

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "operational", "system": "Riftbound Neural Nexus"}

@app.post("/act", response_model=ActionModel)
def predict_action(state: GameStateModel):
    """
    Receives the serialized game state and returns the optimal action.
    Uses the trained PPO model to predict, then maps the action index
    back to a concrete game action based on available legal moves.
    """
    try:
        logger.info(f"Inferencing for Turn {state.turn}, Phase {state.phase} | Active: {state.activePlayer}")

        # Real Vectorization
        observation = vectorizer.vectorize(state.model_dump())

        # Predict action index using the trained model
        action_idx = agent.predict(observation)
        logger.info(f"Agent predicted action index: {action_idx}")

        # Build list of legal actions from the state to map index -> action
        active_id = state.activePlayer
        player_state = state.players.get(active_id)
        legal_actions: list[ActionModel] = []

        if player_state:
            # Play any affordable card
            for card in player_state.hand:
                if card.cost <= player_state.mana:
                    legal_actions.append(ActionModel(type="PLAY_CARD", playerId=active_id, cardId=card.instanceId))
            # Attack with any unit on field
            for card in player_state.field:
                legal_actions.append(ActionModel(type="ATTACK", playerId=active_id, cardId=card.instanceId))

        # Always allow END_TURN / PASS as fallback
        legal_actions.append(ActionModel(type="PASS", playerId=active_id))

        # Clamp prediction to legal range
        idx = min(int(action_idx), len(legal_actions) - 1)
        idx = max(idx, 0)
        chosen = legal_actions[idx]

        logger.info(f"Mapped to action: {chosen.type} (index {idx}/{len(legal_actions)-1})")
        return chosen

    except Exception as e:
        logger.error(f"Inference error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Training state ---
_training_lock = threading.Lock()
_training_status = {"running": False, "progress": 0, "total": 0, "error": None}

def _run_training(total_timesteps: int):
    """Background training worker."""
    global _training_status
    try:
        _training_status = {"running": True, "progress": 0, "total": total_timesteps, "error": None}
        logger.info(f"Background training started: {total_timesteps} timesteps")
        agent.train(total_timesteps=total_timesteps)
        _training_status["running"] = False
        _training_status["progress"] = total_timesteps
        logger.info("Background training completed successfully.")
    except Exception as e:
        _training_status["running"] = False
        _training_status["error"] = str(e)
        logger.error(f"Background training failed: {e}")

@app.post("/train")
def trigger_training(timesteps: int = 10000):
    """
    Triggers a background PPO training session using the RiftboundEnv.
    Returns immediately; poll /train/status for progress.
    """
    if _training_status["running"]:
        raise HTTPException(status_code=409, detail="Training already in progress")

    thread = threading.Thread(target=_run_training, args=(timesteps,), daemon=True)
    thread.start()
    return {"status": "training_initiated", "target_timesteps": timesteps}

@app.get("/train/status")
def training_status():
    """Returns the current training status."""
    return _training_status

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
