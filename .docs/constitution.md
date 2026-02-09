# 🏛️ Riftbound Simulator TCG - Constitutional Charter

> **Version**: 1.0.0  
> **Ratified**: 2026-02-09  
> **Scope**: Desarrollo, Arquitectura, Seguridad y Gobernanza de IA

Este documento establece las **reglas inmutables** que gobiernan toda contribución humana o generada por IA al proyecto Riftbound Simulator TCG. Cualquier código que viole estos principios DEBE ser rechazado en revisión.

---

## Artículo I: Principios Fundamentales

### §1.1 Determinismo del Motor
> **INMUTABLE**: El `CoreEngine` DEBE ser una función pura.

```
f(state, action) → state'
```

- **Prohibido**: Uso de `Math.random()` sin seed controlado.
- **Prohibido**: Acceso a APIs de red, filesystem o tiempo real dentro del engine.
- **Obligatorio**: Todo RNG debe usar `nextRandom()` derivado del seed serializado.

### §1.2 Separación Datos/Lógica
> **INMUTABLE**: Las definiciones de cartas son DATOS, no código.

- Las cartas DEBEN definirse en `src/data/riftbound-data.json`.
- La lógica de efectos DEBE ser interpretada por el engine, no hardcodeada por carta.
- **Prohibido**: Crear archivos `.ts` específicos por carta (ej. `FireballCard.ts`).

### §1.3 Serializabilidad Total
> **INMUTABLE**: Todo estado DEBE ser serializable a JSON.

- El estado del juego DEBE poder exportarse e importarse sin pérdida.
- **Prohibido**: Uso de `class` con métodos en el estado serializado.
- **Prohibido**: Referencias circulares en objetos de estado.

---

## Artículo II: Seguridad por Diseño

### §2.1 Principio de Need-to-Know (Información Oculta)
> **INMUTABLE**: El cliente NUNCA debe recibir información que no le corresponde.

En modo multijugador:
- La mano del oponente DEBE representarse como `CardBack[]`, no `Card[]`.
- El mazo del oponente DEBE ser un contador `deckCount: number`, no el array real.
- Los IDs de cartas ocultas DEBEN ser UUIDs regenerados en cada partida.

### §2.2 Validación Autoritativa
> **INMUTABLE**: El servidor (o host) es la única fuente de verdad.

- **Prohibido**: Que el cliente calcule el resultado de combate sin validación.
- **Prohibido**: Confiar en datos enviados por el cliente sin sanitización.
- El cliente DEBE enviar acciones (`Action`), el servidor DEBE aplicarlas y devolver el nuevo estado.

### §2.3 Integridad del RNG
> **INMUTABLE**: El shuffle DEBE ser verificable post-partida.

- La seed inicial DEBE almacenarse en el `ReplayData`.
- Dado un replay, cualquier cliente DEBE poder reproducir la partida bit-a-bit.
- **Recomendado**: Implementar sistema "Provably Fair" con hash commitment.

---

## Artículo III: Arquitectura de Código

### §3.1 Límites de Responsabilidad
> **DIRECTIVA**: Un módulo DEBE tener una única responsabilidad.

| Módulo | Responsabilidad Única |
|--------|----------------------|
| `CoreEngine.ts` | Transiciones de estado deterministas |
| `CombatResolver.ts` | Resolución de daño y keywords de combate |
| `RuntimeCard.ts` | Representación de instancia de carta en juego |
| `game-store.ts` | Bridge entre UI y Engine (Zustand) |

### §3.2 Prohibición de God Components
> **DIRECTIVA**: Ningún archivo DEBE exceder 800 líneas.

Si un archivo supera 600 líneas, DEBE evaluarse su refactorización en:
- Extracción de clases helper (ej. `MulliganHandler.ts`)
- Separación de concerns en módulos dedicados

### §3.3 Dependencias Unidireccionales
> **DIRECTIVA**: El flujo de dependencias DEBE ser acíclico.

```
UI Components → Stores → Services → Engine → Types
                                        ↓
                                   RuntimeCard
```

**Prohibido**: Que `CoreEngine` importe desde `services/` o `store/`.

---

## Artículo IV: Sistema de Efectos

### §4.1 Efectos como Datos
> **DIRECTIVA**: Los efectos de cartas DEBEN ser declarativos.

Formato recomendado para `riftbound-data.json`:
```json
{
  "id": "SPELL-001",
  "effects": [
    { "trigger": "ON_PLAY", "action": "DAMAGE", "amount": 3, "target": "SELECTED_UNIT" }
  ]
}
```

**Prohibido**: Hardcodear lógica en `applyTargetEffect()` con condicionales por nombre de carta.

### §4.2 Stack de Prioridad
> **DIRECTIVA**: Los efectos DEBEN resolverse en orden LIFO.

- Los spells Fast/Slow DEBEN añadirse al `stack: StackItem[]`.
- Ambos jugadores DEBEN tener oportunidad de responder antes de resolución.
- Solo cuando ambos pasan consecutivamente se resuelve el tope del stack.

---

## Artículo V: Testing y Calidad

### §5.1 Cobertura del Motor
> **DIRECTIVA**: El `CoreEngine` DEBE tener >80% de cobertura de tests.

Tests obligatorios:
- [ ] Determinismo: Mismo seed → mismo resultado
- [ ] Mulligan: Intercambio correcto de cartas
- [ ] Combate: Quick Attack, Barrier, Overwhelm, Lifesteal, Tough
- [ ] Stack: Resolución LIFO de spells

### §5.2 Tests de Integración
> **DIRECTIVA**: Cada keyword DEBE tener tests de interacción.

Ejemplo: `Quick Attack` + `Barrier` → El atacante golpea primero, la barrera se consume.

---

## Artículo VI: Gobernanza de IA

### §6.1 Límites de Generación
> **DIRECTIVA**: Los agentes de IA DEBEN respetar esta Constitución.

Antes de generar código, el agente DEBE:
1. Verificar que no viola ningún artículo `INMUTABLE`.
2. Consultar `constitution.md` si existe ambigüedad.
3. Añadir tests para cualquier nueva funcionalidad.

### §6.2 Prohibición de Alucinaciones
> **DIRECTIVA**: Los agentes NO DEBEN inventar mecánicas no especificadas.

Si una mecánica no está definida en:
- `riftbound-data.json`
- `game.types.ts`
- Esta Constitución

El agente DEBE solicitar clarificación antes de implementar.

---

## Anexo A: Checklist de Pull Request

Antes de aprobar un PR, verificar:

- [ ] ¿El código modifica el engine? → Ejecutar `npm test`
- [ ] ¿Se añaden keywords? → Añadir tests en `keyword-interactions.test.ts`
- [ ] ¿Se modifica el estado? → Verificar serializabilidad
- [ ] ¿Se añade RNG? → Usar `nextRandom()` del engine
- [ ] ¿Se expone información al cliente? → Aplicar Need-to-Know

---

## Anexo B: Glosario

| Término | Definición |
|---------|-----------|
| **Determinismo** | Dado el mismo input, siempre produce el mismo output |
| **LCG** | Linear Congruential Generator - algoritmo de RNG usado |
| **ATD** | Architectural Technical Debt - deuda técnica estructural |
| **SDD** | Spec-Driven Development - desarrollo guiado por especificación |
| **LIFO** | Last In, First Out - orden de resolución del stack |

---

*Este documento es la ley suprema del repositorio. Ningún código, commit o merge que lo viole será aceptado.*
