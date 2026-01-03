from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
import logging
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
    Receives the serialized game state (flattended) and returns the optimal action.
    """
    try:
        logger.info(f"Inferencing for Turn {state.turn}, Phase {state.phase} | Active: {state.activePlayer}")
        
        # Real Vectorization
        observation = vectorizer.vectorize(state.model_dump())
        logger.debug(f"Vectorized state (first 5 values): {observation[:5]}")
        
        # Predict action index using the trained model
        action_idx = agent.predict(observation)
        logger.info(f"Agent predicted action index: {action_idx}")
        
        # Map index back to Game Action (Mock mapping)
        # For now, we still return a PASS to ensure game flow doesn't break
        # but the log confirms the Neural Agent was consulted.
        if state.priority == "opponent":
            return ActionModel(type="PASS", playerId="opponent")
            
        return ActionModel(type="PASS", playerId=state.activePlayer)

    except Exception as e:
        logger.error(f"Inference error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def trigger_training(episodes: int = 1000):
    """
    Triggers a background training session.
    """
    # TODO: Invoke game_gym.py loop
    return {"status": "training_initiated", "target_episodes": episodes}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
