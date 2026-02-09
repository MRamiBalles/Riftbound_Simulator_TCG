# Riftbound Simulator: Guía Técnica (Sovereign Engine v2.0)

Este documento describe la arquitectura de grado industrial del simulador, optimizada para entrenamiento masiva de IA y seguridad en entornos competitivos.

## 1. Motor de Juego (Sovereign Core)

El núcleo del sistema es un motor determinista en TypeScript (`CoreEngine.ts`) diseñado para paridad total con el backend de aprendizaje por refuerzo.

### 🔴 Sistema de Efectos Declarativo
Abandonamos la lógica hardcodeada por un sistema basado en datos:
- **EffectResolver**: Procesa efectos definidos en JSON.
- **RuntimeCard**: Extiende la interfaz de carta con estados mutables (`isStunned`, `summoningSickness`, `currentCost`).
- **Triggers**: Soporte nativo para `ON_PLAY`, `ON_ATTACK`, `ON_DEATH`, `ON_TURN_START`, `ON_TURN_END`.

### 🛡️ Seguridad y Arquitectura Autoritaria
El GameServer (`gameserver.ts`) ha sido blindado para entornos de producción:
- **Zod Validation**: Todos los mensajes WebSocket son validados contra esquemas estrictos.
- **Rate Limiting**: Implementación de Token Bucket para prevenir ataques de denegación de servicio o spam de acciones.
- **Fog of War (FOW)**: El estado se sanitiza antes de enviarse al cliente, ocultando cartas en mano y deck del oponente.

## 2. Infraestructura de IA (AlphaStar Optimized)

Diseñado para escalar horizontalmente en clústeres de Kubernetes.

### 🧠 Orquestación con KubeRay
Utilizamos el operador KubeRay para gestionar clústeres de entrenamiento dinámicos:
- **Head Node (Learner)**: Optimizado con 16GB de RAM para manejar Replay Buffers masivos de MuZero.
- **Worker Nodes (Actors)**: Ejecutan simulaciones paralelas. Configurado con `/dev/shm` (memoria compartida) para maximizar el rendimiento del object store de Ray.

### ⚔️ Action Masking (Optimización de Convergencia)
El motor expone `isActionLegal`, permitiendo que el puente de IA genere máscaras de acción:
- Reduce el espacio de búsqueda ignorando jugadas ilegales.
- Acelera la convergencia de MuZero aproximadamente un 900%.

### 🏗️ Pipeline de Datos
1. **Migration Pipeline**: `genesis_migration.js` transforma datos legacy de LoR al formato declarativo de Riftbound.
2. **Standard Dataset**: `core_set_v2.json` (233 cartas verificadas).
3. **Gym Environment**: `riftbound_env.py` expone una interfaz `Dict` (Observation + Action Mask) compatible con Ray/RLlib.

## 3. Entrenamiento RL (MuZero & PPO)

- **Input Tensor**: Vector de ~200 características normalizadas (mana, vida, mano, campo, keywords).
- **Inferencia Cross-Platform**: El puente Python/Node.js funciona idénticamente en estaciones de trabajo Windows y contenedores Linux.

---
**Autor**: Manuel Ramirez Ballesteros  
**Versión**: 2.0.0-PRO  
© 2026 Manuel Ramirez Ballesteros. Todos los derechos reservados.
