import * as ort from 'onnxruntime-web';
import { SerializedGameState, Action, PlayerId } from '../engine/game.types';
import { EncodingService, ActionSpaceMapper } from '../../services/rl/encoding-service';

export class NeuralBot {
    private session: ort.InferenceSession | null = null;
    private modelPath: string;
    private playerId: PlayerId;

    constructor(playerId: PlayerId = 'opponent', modelPath: string = '/models/riftbound_agent_v1.onnx') {
        this.playerId = playerId;
        this.modelPath = modelPath;
    }

    /**
     * Initializes the ONNX session. Should be called before decideAction.
     */
    public async initialize() {
        if (this.session) return;
        try {
            // In a real environment, we'd need the .wasm files in the public folder
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
            this.session = await ort.InferenceSession.create(this.modelPath);
            console.log('[NeuralBot] Session initialized successfully');
        } catch (e) {
            console.error('[NeuralBot] Failed to initialize ONNX session:', e);
            throw e;
        }
    }

    /**
     * Predicts the best action for the current state.
     */
    public async decideAction(state: SerializedGameState): Promise<{ action: Action | null, confidence: number[] }> {
        if (!this.session) {
            await this.initialize();
        }

        if (!this.session) return { action: null, confidence: [] };

        // 1. Encode State
        const encoded = EncodingService.encode(state, this.playerId);
        const float32Data = new Float32Array(encoded);
        const tensor = new ort.Tensor('float32', float32Data, [1, encoded.length]);

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
    }

    private softmax(arr: number[]): number[] {
        const C = Math.max(...arr);
        const d = arr.map(y => Math.exp(y - C)).reduce((a, b) => a + b);
        return arr.map(value => Math.exp(value - C) / d);
    }
}
