# Riftbound Simulator: Guía Técnica

Este documento describe la arquitectura del sistema, las decisiones de diseño tomadas y los fundamentos teóricos de cada componente.

## 1. Motor de juego

El núcleo del simulador es una máquina de estados determinista implementada en `CoreEngine.ts`. Dado un estado serializado y una acción, produce un nuevo estado sin efectos secundarios.

### Serialización y paridad

El estado del juego se representa como objetos planos (POJOs) serializables a JSON. Esto permite:
- Replays bit-perfect al guardar la secuencia de acciones.
- Transferencia directa entre el frontend TypeScript y el backend Python para entrenamiento de IA.

### Resolución de combate

El sistema de combate procesa keywords en orden específico:
1. **Quick Attack**: El atacante con esta habilidad inflige daño primero.
2. **Barrier**: Absorbe la siguiente instancia de daño (no se consume con 0 de daño).
3. **Overwhelm**: El exceso de daño sobre la vida del defensor impacta al Nexus.

## 2. Arquitectura de IA

### Representación semántica (Fase 1)

Las cartas se codifican mediante embeddings de `sentence-transformers/all-MiniLM-L6-v2`. La elección de este modelo responde a:
- Tamaño reducido (~90MB) compatible con ejecución local.
- Vectores de 384 dimensiones que capturan relaciones semánticas entre efectos de cartas.

El Atlas Semántico (`src/data/semantic_atlas.json`) almacena los primeros 16 componentes de cada embedding, suficientes para el pipeline espacial.

### Representación espacial (Fase 2)

El tablero táctico de 9x5 se representa como un tensor `[C, 9, 5]` donde C=32 canales incluyen:
- 16 canales semánticos (embedding comprimido de cada unidad).
- Canales de presencia, propietario, ataque, vida y keywords binarios.

Esta estructura (inspirada en AlphaZero) permite que las convoluciones capturen patrones posicionales.

### MuZero Nexus (Fase 3)

La arquitectura MuZero consta de tres redes:
- **Representation (h)**: Codifica observaciones en estados latentes.
- **Dynamics (g)**: Predice el siguiente estado latente dada una acción.
- **Prediction**: Genera política y valor desde el estado latente.

Se añade un **Observation Decoder** que reconstruye características observables desde el latente. Esto previene "alucinaciones" donde el modelo imagina estados imposibles.

### Liga adversarial ROA-Star (Fase 4)

El sistema entrena explotadores que maximizan:
```
R_exploiter = R_env - α · V_opponent(s')
```
Donde α=0.1 evita comportamiento "kamikaze". El explotador entrenado alcanzó 86% de victorias contra el agente base en 50 episodios.

### Destilación RTIM (Fase 5)

TinyZero es un modelo compacto (16 canales latentes, 1 bloque residual) entrenado mediante destilación de conocimiento:
```
L_distill = α·T² · KL(softmax(z_t/T), softmax(z_s/T)) + (1-α)·L_task
```
El modelo resultante ocupa 0.01 MB y puede ejecutarse en cualquier navegador moderno.

### Telemetría de drift (Fase 6)

`DriftWatchdog.ts` monitoriza la confianza del modelo durante partidas reales. Si la confianza media cae bajo 70% contra un arquetipo específico (identificado por hash de mazo), se genera una alerta para re-entrenamiento.

## 3. Gestión de estado (Frontend)

La aplicación utiliza Zustand con stores modulares:
- `useGameStore`: Estado de partida activa.
- `useCollectionStore`: Inventario y mazos del usuario.

## 4. Flujo de datos de entrenamiento

```
[sync-api-cards.ps1] → riftbound-data.json
                         ↓
[card_embeddings.py] → card_embeddings_cache.json
                         ↓
[game_gym.py] → Gymnasium Environment [32, 9, 5]
                         ↓
[train_muzero_pro.py] → muzero_main_v1.pt
                         ↓
[train_student.py] → tiny_zero_student.pt
                         ↓
[export_onnx.py] → riftbound_brain_v1.onnx
```

---

**Autor**: Manuel Ramirez Ballesteros  
**Contacto**: ramiballes96@gmail.com  

© 2026 Manuel Ramirez Ballesteros. Todos los derechos reservados.
