// src/models/gameModels.ts

export const GamePhase = {
    PLACEMENT: 'PLACEMENT',
    MOVEMENT: 'MOVEMENT',
    STUCK_REMOVAL: 'STUCK_REMOVAL',
    GAME_OVER: 'GAME_OVER'
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

export interface Position {
    r: number;
    c: number;
}

export interface Move {
    from: Position | null;
    to: Position;
}

export interface PlayerMoveRequest {
    gameUUId: string;
    board: (string | null)[][];
    currentPlayer: string;
    phase: GamePhase;
    move: Move;
    lastMoveX: Move | null;
    lastMoveO: Move | null;
    moveIndex: number;
}

export interface AiMoveRequest {
    gameUUId: string;
    board: (string | null)[][];
    currentPlayer: string;
    phase: GamePhase;
    difficulty: number;
    lastMoveX: Move | null;
    lastMoveO: Move | null;
    moveIndex: number;
}

export interface MoveResponse {
    success: boolean;
    move: Move;
    newBoard: (string | null)[][];
    capturedPieces: Position[];
    capturedCount: number;
    nextPlayer: string;
    nextPhase: GamePhase;
    winner: string | null;
    isGameOver: boolean;
    message: string;
}