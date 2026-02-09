"use strict";
/**
 * @fileoverview Riftbound Effect System - Type Definitions
 * @version 1.0.0
 *
 * Schema declarativo para efectos de cartas. Este archivo define el CONTRATO
 * de datos que permite serializar efectos para:
 * - Validación autoritativa del servidor
 * - Generación de cartas por IA
 * - Replays deterministas
 *
 * @constitution Artículo IV §4.1 - Los efectos DEBEN ser datos, no código.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EFFECT_SCHEMA_VERSION = void 0;
// =============================================================================
// VERSION CONTROL
// =============================================================================
/** Schema version for client-server compatibility validation */
exports.EFFECT_SCHEMA_VERSION = '1.0.0';
