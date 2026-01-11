/**
 * DriftWatchdog: Monitor de Deriva Estratégica del Meta
 * ======================================================
 * 
 * Servicio cliente que monitoriza la confianza del modelo TinyZero durante
 * partidas reales. Detecta "Meta Drift" cuando aparecen estrategias nuevas
 * que el modelo no vio durante el entrenamiento.
 * 
 * Funcionamiento:
 * 1. Durante cada turno, se registra la confianza del modelo (output del value head).
 * 2. Al finalizar la partida, se calcula la confianza media.
 * 3. Si la confianza media cae bajo el umbral (70%), se genera una alerta.
 * 4. Los mazos se identifican por hash para detectar arquetipos problemáticos.
 * 
 * Este sistema permite detectar proactivamente cuando el modelo necesita
 * re-entrenamiento sin esperar a que los jugadores reporten problemas.
 * 
 * @author Manuel Ramirez Ballesteros
 * @email ramiballes96@gmail.com
 * @copyright 2026 Manuel Ramirez Ballesteros. All rights reserved.
 */

/** Estructura del informe de telemetría enviado al servidor */
export interface DriftReport {
    /** Hash único del mazo oponente (identifica arquetipos) */
    opponentDeckHash: string;
    /** Número de turnos jugados en la partida */
    turnsPlayed: number;
    /** Resultado de la partida desde la perspectiva de la IA */
    result: 'WIN' | 'LOSS' | 'DRAW';
    /** Confianza media del modelo durante la partida [0.0 - 1.0] */
    averageConfidence: number;
    /** Timestamp Unix del informe */
    timestamp: number;
}


export class DriftWatchdog {
    /** Lecturas de confianza por turno */
    private confidenceReadings: number[] = [];
    /** Contador de turnos */
    private turnsPlayed: number = 0;
    /** Umbral bajo el cual se considera drift (70%) */
    private readonly DRIFT_THRESHOLD = 0.7;

    /**
     * Registra la confianza del modelo para el turno actual.
     * Llamar después de cada inferencia del modelo.
     * 
     * @param confidence - Salida del value head normalizada [0, 1]
     */
    public recordTurn(confidence: number): void {
        this.confidenceReadings.push(confidence);
        this.turnsPlayed++;
    }

    /**
     * Genera un hash único para identificar la composición del mazo oponente.
     * Permite agrupar partidas contra el mismo arquetipo.
     * 
     * @param cardIds - Array de IDs de cartas jugadas/vistas del oponente
     * @returns Hash string del mazo
     */
    public hashDeck(cardIds: string[]): string {
        // Ordenar IDs para que el orden de aparición no afecte el hash
        const sortedIds = [...cardIds].sort().join('|');

        // Hash simple pero efectivo para este caso de uso
        let hash = 0;
        for (let i = 0; i < sortedIds.length; i++) {
            const char = sortedIds.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convertir a entero de 32 bits
        }
        return hash.toString();
    }

    /**
     * Finaliza la partida y genera el informe de telemetría.
     * Llamar al terminar cada partida.
     * 
     * @param opponentPlayedCards - Cartas que el oponente jugó durante la partida
     * @param result - Resultado de la partida
     * @returns Informe de drift generado
     */
    public finalizeMatch(
        opponentPlayedCards: string[],
        result: 'WIN' | 'LOSS' | 'DRAW'
    ): DriftReport {
        // Calcular confianza media
        const avgConf = this.confidenceReadings.length > 0
            ? this.confidenceReadings.reduce((a, b) => a + b, 0) / this.confidenceReadings.length
            : 0;

        const report: DriftReport = {
            opponentDeckHash: this.hashDeck(opponentPlayedCards),
            turnsPlayed: this.turnsPlayed,
            result: result,
            averageConfidence: avgConf,
            timestamp: Date.now()
        };

        // Verificar drift y subir informe
        this.checkDrift(report);
        this.uploadReport(report);

        // Resetear estado para próxima partida
        this.reset();

        return report;
    }

    /**
     * Verifica si el informe indica deriva estratégica.
     * 
     * @param report - Informe a analizar
     */
    private checkDrift(report: DriftReport): void {
        if (report.averageConfidence < this.DRIFT_THRESHOLD) {
            console.warn(
                `[ALERTA DRIFT] Confianza baja (${(report.averageConfidence * 100).toFixed(1)}%) ` +
                `contra mazo hash ${report.opponentDeckHash}. Posible deriva del meta.`
            );
            // En producción: enviar notificación push al dashboard de GameOps
        }
    }

    /**
     * Envía el informe al servidor de telemetría.
     * 
     * @param report - Informe a subir
     */
    private uploadReport(report: DriftReport): void {
        // En desarrollo: solo log a consola
        console.log("Informe de telemetría:", report);

        // En producción: descomentar para enviar a API
        // fetch('/api/telemetry/drift', { 
        //     method: 'POST', 
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(report) 
        // });
    }

    /**
     * Resetea el estado del watchdog para una nueva partida.
     */
    private reset(): void {
        this.confidenceReadings = [];
        this.turnsPlayed = 0;
    }
}


// Instancia singleton para uso global
export const driftWatchdog = new DriftWatchdog();
