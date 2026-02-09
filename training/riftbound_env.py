
import gymnasium as gym
import subprocess
import json
import numpy as np
from gymnasium import spaces
import sys
import os

class RiftboundEnv(gym.Env):
    metadata = {"render_modes": ["human"], "render_fps": 4}

    def __init__(self, config=None):
        super().__init__()
        
        # Action Space: 48 discrete actions
        self.action_space = spaces.Discrete(48)
        
        # Observation Space: 200 float features
        self.observation_space = spaces.Box(
            low=0, high=1, shape=(200,), dtype=np.float32
        )
        
        self.node_process = None
        # Path to headless-bridge script (compiled JS)
        local_bridge = os.path.join(os.path.dirname(__file__), "../scripts/headless-bridge.js")
        self.bridge_path = config.get("bridge_path", local_bridge) if config else local_bridge
        
        self._start_node_bridge()

    def _start_node_bridge(self):
        """Spawns the Node.js simulation bridge."""
        if self.node_process:
            self.node_process.kill()
            
        try:
            self.node_process = subprocess.Popen(
                ['node', self.bridge_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1  # Line buffered
            )
            
            # Wait for ready signal? Ideally implemented in protocol
        except Exception as e:
            print(f"Failed to start node bridge: {e}")
            raise e

    def _send_command(self, method, params=None):
        if not self.node_process or self.node_process.poll() is not None:
            self._start_node_bridge()
            
        cmd = {
            "id": 1, 
            "method": method, 
            "params": params or {}
        }
        
        try:
            json_cmd = json.dumps(cmd)
            self.node_process.stdin.write(json_cmd + "\n")
            self.node_process.stdin.flush()
            
            response_line = self.node_process.stdout.readline()
            if not response_line:
                stderr = self.node_process.stderr.read()
                raise RuntimeError(f"Node process closed unexpectedly. Stderr: {stderr}")
                
            try:
                response = json.loads(response_line)
            except json.JSONDecodeError:
                 # Skip potential debug logs
                 return self._send_command(method, params)

            if response.get("error"):
                raise RuntimeError(f"Bridge Error: {response['error']}")
                
            return response.get("result")
        except BrokenPipeError:
            self._start_node_bridge()
            # Retry once
            return self._send_command(method, params)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        result = self._send_command("reset")
        if not result:
             raise RuntimeError("Reset returned empty result")

        obs = np.array(result.get("observation", []), dtype=np.float32)
        
        # Pad observation
        current_len = len(obs)
        if current_len < 200:
            obs = np.pad(obs, (0, 200 - current_len), 'constant')
            
        return obs, result.get("info", {})

    def step(self, action):
        result = self._send_command("step", {"action": int(action)})
        
        obs = np.array(result.get("observation", []), dtype=np.float32)

        # Pad observation
        current_len = len(obs)
        if current_len < 200:
            obs = np.pad(obs, (0, 200 - current_len), 'constant')
            
        reward = float(result.get("reward", 0.0))
        done = bool(result.get("done", False))
        truncated = bool(result.get("truncated", False))
        
        return obs, reward, done, truncated, result.get("info", {})

    def close(self):
        if self.node_process:
            self.node_process.terminate()
