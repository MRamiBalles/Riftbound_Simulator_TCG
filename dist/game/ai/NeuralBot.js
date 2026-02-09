"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralBot = void 0;
const encoding_service_1 = require("../../services/rl/encoding-service");
class NeuralBot {
    session = null;
    ort = null;
    modelPath;
    playerId;
    constructor(playerId = 'opponent', modelPath = '/models/riftbound_agent_v1.onnx') {
        this.playerId = playerId;
        this.modelPath = modelPath;
    }
    /**
     * [Resilience Pattern: Graceful Degradation]
     * Initializes the ONNX session using dynamic imports.
     *
     * Architecture Note:
     * We use `import('onnxruntime-web')` instead of a top-level static import.
     * This ensures that if the dependency is missing (e.g. fresh clone before `npm install`),
     * the application still boots (falling back to Heuristic Mode) rather than crashing with a "Module Not Found" error.
     */
    async initialize() {
        if (this.session)
            return;
        try {
            if (!this.ort) {
                this.ort = await Promise.resolve().then(() => __importStar(require('onnxruntime-web')));
            }
            this.ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
            this.session = await this.ort.InferenceSession.create(this.modelPath);
            console.log('[NeuralBot] Session initialized successfully via dynamic import');
            // Trigger JIT Compilation for WebGL shaders
            await this.warmup();
        }
        catch (e) {
            console.error('[NeuralBot] Initialization failed. System will fallback to Heuristic Mode. Ensure `npm install` has been run.', e);
            throw e;
        }
    }
    /**
     * [Optimization: Cold Start Mitigation]
     * Runs a dummy inference with a zero-tensor to force the WebGL backend
     * to compile its shader programs.
     *
     * Without this, the first player action would suffer a visible frame drop (~500ms)
     * while the GPU context initializes.
     */
    async warmup() {
        if (!this.session || !this.ort)
            return;
        try {
            // Dummy vector of size 200 (approx max state size)
            const dummyData = new Float32Array(200).fill(0.1);
            const tensor = new this.ort.Tensor('float32', dummyData, [1, 200]);
            await this.session.run({ input: tensor });
            console.log('[NeuralBot] Warm-up complete. Zero-latency ready.');
        }
        catch (e) {
            console.warn('[NeuralBot] Warm-up failed (non-critical):', e);
        }
    }
    /**
     * Predicts the best action for the current state.
     */
    async decideAction(state) {
        try {
            if (!this.session) {
                await this.initialize();
            }
            if (!this.session || !this.ort)
                return { action: null, confidence: [] };
            // 1. Encode State
            const encoded = encoding_service_1.EncodingService.encode(state, this.playerId);
            const float32Data = new Float32Array(encoded);
            const tensor = new this.ort.Tensor('float32', float32Data, [1, encoded.length]);
            // 2. Run Inference
            const feeds = { input: tensor };
            const results = await this.session.run(feeds);
            // Assume output name is 'output' or 'logits'
            const outputTensor = results[Object.keys(results)[0]];
            const logits = outputTensor.data;
            // 3. Process Logits (Softmax for confidence)
            const confidence = this.softmax(Array.from(logits));
            // 4. Select Action
            const actionIdx = confidence.indexOf(Math.max(...confidence));
            const action = encoding_service_1.ActionSpaceMapper.mapToEngine(actionIdx, state, this.playerId);
            return { action, confidence };
        }
        catch (error) {
            console.error('[NeuralBot] Inference Error:', error);
            return { action: null, confidence: [] };
        }
    }
    softmax(arr) {
        const C = Math.max(...arr);
        const d = arr.map(y => Math.exp(y - C)).reduce((a, b) => a + b);
        return arr.map(value => Math.exp(value - C) / d);
    }
}
exports.NeuralBot = NeuralBot;
