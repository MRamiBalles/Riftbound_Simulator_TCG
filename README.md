# Riftbound Simulator TCG

Sistema de simulación e inteligencia artificial para el juego de cartas coleccionables Riftbound. Este proyecto implementa un motor de juego determinista junto con una arquitectura de aprendizaje por refuerzo basada en MuZero, optimizada para inferencia en navegador.

## Características principales

- **Motor determinista**: Estados serializables al 100%, permitiendo replays exactos y entrenamiento reproducible.
- **IA estratégica (MuZero)**: Red de dinámica que predice transiciones de estado sin ejecutar el motor completo.
- **Inferencia edge**: Modelo TinyZero destilado (<0.1 MB) exportado a ONNX para ejecución en cliente web.
- **Embeddings semánticos**: Las cartas se representan mediante vectores MiniLM, permitiendo generalización ante nuevas expansiones.
- **Liga adversarial (ROA-Star)**: Entrenamiento de agentes explotadores para robustez estratégica.

## Estructura del proyecto

```
Riftbound_Simulator_TCG/
├── src/                    # Motor TS and Frontend Next.js
│   ├── game/engine         # Sovereign Core Engine
│   └── services/rl         # Encoding & Action Mapping
├── training/               # Python RL Infrastructure
│   ├── riftbound_env.py    # Gymnasium Environment (Action Masking)
│   └── train_ppo.py        # Ray/RLlib PPO Orchestrator
├── k8s/                    # Kubernetes Manifests
│   ├── ray-cluster.yaml    # Infrastructure (KubeRay)
│   └── training-job.yaml   # AI Training Job
├── scripts/                # Bridge & Migration tools
│   ├── headless-bridge.ts  # RL Bridge (Node.js)
│   └── genesis_migration.js# Mass migration tool
└── public/                 # Assets & Data (core_set_v2.json)
```

## Requisitos

- Node.js 18+
- Python 3.12+
- PyTorch 2.x
- sentence-transformers

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MRamiBalles/Riftbound_Simulator_TCG.git

# Instalar dependencias frontend
npm install

# Instalar dependencias backend
pip install -r backend/requirements.txt

# Iniciar servidor de desarrollo
npm run dev
```

## Pipeline de IA

1. **Sincronización de datos**: `scripts/sync-api-cards.ps1` obtiene las cartas desde la API oficial.
2. **Generación de embeddings**: `backend/embeddings/card_embeddings.py` crea vectores semánticos.
3. **Entrenamiento MuZero**: `backend/train_muzero_pro.py` entrena el agente principal.
4. **Destilación**: `backend/train_student.py` comprime el conocimiento en TinyZero.
5. **Exportación**: `scripts/export_onnx.py` genera el modelo para navegador.

## Documentación adicional

- [Guía Técnica](TECHNICAL_GUIDE.md): Detalles de arquitectura y decisiones de diseño.
- [Changelog](CHANGELOG.md): Historial de cambios por versión.

## Infraestructura y Entrenamiento Masivo

### 🔴 Sistema de Efectos Declarativo
El motor utiliza ahora un sistema basado en datos (`src/game/engine/effects`) que permite:
- Migración automatizada de cartas mediante `scripts/genesis_migration.js`.
- Soporte para triggers complejos (`ON_DEATH`, `ON_ATTACK`, `ON_TURN_START/END`).
- Dataset verificado de **233 cartas** en `src/data/core_set_v2.json`.

### 🛡️ Servidor Autoritativo
Servidor WebSocket blindado con:
- Validación de esquemas via `Zod`.
- Rate Limiting (Token Bucket).
- Fog of War nativo para evitar visibilidad total del estado.

### 🧠 Kubernetes & Ray Cluster
Infraestructura escalable para entrenamiento MuZero:
- **KubeRay Operator**: Orquestación de clústeres de Ray.
- **Memoria Compartida (/dev/shm)**: Optimizado para el Plasma Object Store de Ray.
- **Observabilidad**: Integración con Prometheus para el monitoreo de métricas de recompensa.

Para desplegar localmente:
```bash
kubectl apply -f k8s/ray-cluster.yaml
kubectl apply -f k8s/training-job.yaml
```

---

**Autor**: Manuel Ramirez Ballesteros  
**Contacto**: ramiballes96@gmail.com  
**Licencia**: MIT

© 2026 Manuel Ramirez Ballesteros. Todos los derechos reservados.
