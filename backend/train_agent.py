import argparse
import logging
from agent import agent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("NeuralIgnition")

def main():
    parser = argparse.ArgumentParser(description="Riftbound Neural Ignition: Training Harness")
    parser.add_argument("--steps", type=int, default=20000, help="Total training timesteps (default: 20000)")
    parser.add_argument("--save_path", type=str, default="ppo_riftbound_sovereign", help="Path to save the model")
    
    args = parser.parse_args()
    
    logger.info("--- RIFTBOUND NEURAL IGNITION ---")
    logger.info(f"Target Timesteps: {args.steps}")
    logger.info(f"Save Path: {args.save_path}")
    
    # Initialize the agent
    agent.model_path = args.save_path
    agent.initialize()
    
    # Start the learning loop
    try:
        agent.train(total_timesteps=args.steps)
        logger.info("Neural Ignition Successful. Model optimized and cached.")
    except KeyboardInterrupt:
        logger.warning("Training interrupted by user. Saving current Progress...")
        if agent.model:
            agent.model.save(args.save_path)
    except Exception as e:
        logger.error(f"Critical failure during ignition: {str(e)}")

if __name__ == "__main__":
    main()
