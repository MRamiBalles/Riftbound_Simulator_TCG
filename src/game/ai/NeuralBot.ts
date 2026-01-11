import { SerializedGameState, Action, PlayerId } from '../engine/game.types';
import { EncodingService, ActionSpaceMapper } from '../../services/rl/encoding-service';

export class NeuralBot {
    private session: any | null = null;
    private ort: any | null = null;
    private modelPath: string;
    private playerId: PlayerId;

    constructor(playerId: PlayerId = 'opponent', modelPath: string = '/models/riftbound_agent_v1.onnx') {
        this.playerId = playerId;
        this.modelPath = modelPath;
    }

    /**
     * Initializes the ONNX session using dynamic imports for browser resilience.
     */
    public async initialize() {
        if (this.session) return;

        try {
            // Dynamic import to prevent crash if onnxruntime-web is missing from node_modules
            if (!this.ort) {
                this.ort = await import('onnxruntime-web');
            }

            this.ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
            this.session = await this.ort.InferenceSession.create(this.modelPath);
            console.log('[NeuralBot] Session initialized successfully via dynamic import');
        } catch (e) {
            console.error('[NeuralBot] Failed to initialize ONNX session. Ensure `npm install` has been run.', e);
            throw e;
        }
    }

    /**
     * Predicts the best action for the current state.
     */
    public async decideAction(state: SerializedGameState): Promise<{ action: Action | null, confidence: number[] }> {
        try {
            if (!this.session) {
                await this.initialize();
            }

            if (!this.session || !this.ort) return { action: null, confidence: [] };

            // 1. Encode State
            const encoded = EncodingService.encode(state, this.playerId);
            const float32Data = new Float32Array(encoded);
            const tensor = new this.ort.Tensor('float32', float32Data, [1, encoded.length]);

            // 2. Run Inference
            const feeds = { input: tensor };
            const results = await this.session.run(feeds);

            // Assume output name is 'output' or 'logits'
            const outputTensor = results[Object.keys(results)[0]];
            const logits = outputTensor.data as Float32Array;

            // 3. Process Logits (Softmax for confidence)
            const confidence = this.softmax(Array.from(logits));

            // 4. Select Action
            const actionIdx = confidence.indexOf(Math.max(...confidence));
            const action = ActionSpaceMapper.mapToEngine(actionIdx, state, this.playerId);

            return { action, confidence };
        } catch (error) {
            console.error('[NeuralBot] Inference Error:', error);
            return { action: null, confidence: [] };
        }
    }

    private softmax(arr: number[]): number[] {
        const C = Math.max(...arr);
        const d = arr.map(y => Math.exp(y - C)).reduce((a, b) => a + b);
        return arr.map(value => Math.exp(value - C) / d);
    }
}
