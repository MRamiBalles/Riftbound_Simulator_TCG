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
├── src/                    # Frontend Next.js
│   ├── services/           # Servicios cliente (DriftWatchdog, etc.)
│   └── data/               # Atlas semántico y modelo ONNX
├── backend/                # Motor Python
│   ├── models/             # Arquitecturas MuZero/TinyZero
│   ├── embeddings/         # Cache de vectores semánticos
│   └── league/             # Sistema de liga adversarial
└── scripts/                # Utilidades de sincronización y exportación
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

---

**Autor**: Manuel Ramirez Ballesteros  
**Contacto**: ramiballes96@gmail.com  
**Licencia**: MIT

© 2026 Manuel Ramirez Ballesteros. Todos los derechos reservados.
