from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import sys
import os

# Add parent dir to path to import game_logic
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from game_logic import GameState, Card

app = FastAPI(title="Riftbound AI Inference Server")

class InferenceRequest(BaseModel):
    state: Dict[str, Any]

@app.get("/")
async def root():
    return {"status": "online", "model": "HeuristicV1"}

@app.post("/predict")
async def predict(request: InferenceRequest):
    """
    Takes a SerializedGameState and returns the best Action.
    Currently uses an internal strategy, but can be updated to use a trained model.
    """
    state_data = request.state
    
    # In a real scenario, we'd convert this JSON state into a Gymnasium observation
    # and feed it to a stable-baselines3 model.
    # For now, we return a PASS or END_TURN to verify the connection.
    
    # Mock logic: if player has mana and cards, play first card.
    opponent_state = state_data.get('players', {}).get('opponent', {})
    mana = opponent_state.get('mana', 0)
    hand = opponent_state.get('hand', [])
    
    if mana > 0 and len(hand) > 0:
        card = hand[0]
        if mana >= card.get('currentCost', 99):
            return {
                "type": "PLAY_CARD",
                "playerId": "opponent",
                "cardId": card.get('instanceId')
            }
    
    # If no plays, end turn
    return {
        "type": "END_TURN",
        "playerId": "opponent"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
