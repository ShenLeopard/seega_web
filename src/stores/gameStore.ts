import { defineStore } from 'pinia';
import * as GameService from '../services/gameService';
import * as Models from '../models/gameModels';

export const useGameStore = defineStore('game', {
  state: () => ({
    gameUUId: '',
    board: Array(5).fill(null).map(() => Array(5).fill(null)) as (string | null)[][],
    currentPlayer: 'O' as 'X' | 'O',
    playerSide: 'O' as 'X' | 'O',
    phase: Models.GamePhase.PLACEMENT as Models.GamePhase,
    winner: null as string | null,
    showPhaseTransition: false,
    selectedPiece: null as Models.Position | null,
    hoverPos: null as Models.Position | null, // ✅ 用於預覽
    logs: [] as { msg: string, type: string }[],
    isAiProcessing: false,
    history: [] as string[],
    lastMoves: { X: null as Models.Move | null, O: null as Models.Move | null },
    moveIndex: 0,
    isSetupMode: true,
  }),

  getters: {
    canUndo: (state) => state.history.length > 0 && !state.isAiProcessing,
    // 判斷是否為合法的移動空格（用於移動預覽）
    isAdjacentEmpty: (state) => (r: number, c: number): boolean => {
      if (state.phase !== Models.GamePhase.MOVEMENT || !state.selectedPiece) return false;
      if (state.board[r]?.[c] !== null) return false;

      const dist = Math.abs(r - state.selectedPiece.r) + Math.abs(c - state.selectedPiece.c);
      if (dist !== 1) return false;

      const myLast = state.lastMoves[state.currentPlayer];
      if (myLast?.from && r === myLast.from.r && c === myLast.from.c &&
        state.selectedPiece.r === myLast.to.r && state.selectedPiece.c === myLast.to.c) {
        return false;
      }
      return true;
    },
    isOpponent: (state) => (r: number, c: number) => {
      const p = state.board[r]?.[c];
      return p !== null && p !== state.currentPlayer;
    }
  },

  actions: {
    initGame(isFirst: boolean) {
      this.gameUUId = 'game-' + Math.random().toString(36).substring(2, 11);
      this.isSetupMode = false;
      this.playerSide = 'O';
      this.currentPlayer = isFirst ? 'O' : 'X';
      this.resetBoardState();
    },

    resetBoardState() {
      this.board = Array(5).fill(null).map(() => Array(5).fill(null));
      this.phase = Models.GamePhase.PLACEMENT;
      this.moveIndex = 0;
      this.winner = null;
      this.history = [];
      this.lastMoves = { X: null, O: null };
      this.logs = [{ msg: "對局開始", type: "info" }];
      this.showPhaseTransition = false;
    },

    async handleCellClick(r: number, c: number) {
      if (this.winner || this.isAiProcessing) return;

      if (this.phase === Models.GamePhase.STUCK_REMOVAL) {
        if (this.isOpponent(r, c)) await this.performPlayerMove(null, { r, c });
        return;
      }

      if (this.phase === Models.GamePhase.PLACEMENT) {
        if ((r === 2 && c === 2) || this.board[r]?.[c]) return;
        await this.performPlayerMove(null, { r, c });
      }
      else if (this.phase === Models.GamePhase.MOVEMENT) {
        const cell = this.board[r]?.[c];
        if (cell === this.currentPlayer) {
          this.selectedPiece = { r, c };
        } else if (cell === null && this.selectedPiece) {
          if (this.isAdjacentEmpty(r, c)) await this.performPlayerMove(this.selectedPiece, { r, c });
          this.selectedPiece = null;
        }
      }
    },

    async triggerAi() {
      if (this.winner || this.isAiProcessing) return;
      this.isAiProcessing = true;
      const nextIdx = this.moveIndex + 1;
      try {
        const res = await GameService.ExecuteAiMove({
          gameUUId: this.gameUUId,
          board: this.board,
          currentPlayer: this.currentPlayer,
          phase: this.phase,
          difficulty: 4,
          lastMoveX: this.lastMoves.X,
          lastMoveO: this.lastMoves.O,
          moveIndex: nextIdx
        });
        if (res.success) this.updateState(res, nextIdx);
      } finally { this.isAiProcessing = false; }
    },

    async performPlayerMove(from: Models.Position | null, to: Models.Position) {
      if (this.isAiProcessing) return;
      this.isAiProcessing = true;
      const nextIdx = this.moveIndex + 1;
      try {
        const res = await GameService.ExecutePlayerMove({
          gameUUId: this.gameUUId,
          board: this.board,
          currentPlayer: this.currentPlayer,
          phase: this.phase,
          move: { from, to },
          lastMoveX: this.lastMoves.X,
          lastMoveO: this.lastMoves.O,
          moveIndex: nextIdx
        });
        if (res.success) this.updateState(res, nextIdx);
      } finally { this.isAiProcessing = false; }
    },
    prepareNewGame() {
      this.winner = null;
      this.board = Array(5).fill(null).map(() => Array(5).fill(null));
      this.currentPlayer = 'O';
      this.phase = Models.GamePhase.PLACEMENT;
      this.moveIndex = 0;
      this.history = [];
      this.lastMoves = { X: null, O: null };
      this.isSetupMode = true;
      this.showPhaseTransition = false;
      this.selectedPiece = null;
      this.logs = [{ msg: '遊戲已重置，請選擇先後手。', type: 'info' }];
    },
    updateState(data: Models.MoveResponse, newIdx: number) {
      this.history.push(JSON.stringify({
        board: this.board, currentPlayer: this.currentPlayer, phase: this.phase,
        moveIndex: this.moveIndex, lastMoves: JSON.parse(JSON.stringify(this.lastMoves))
      }));

      const oldPlayer = this.currentPlayer;
      let nextPlayer = data.nextPlayer as 'X' | 'O';

      if (this.phase === Models.GamePhase.PLACEMENT && data.nextPhase === Models.GamePhase.MOVEMENT) {
        this.showPhaseTransition = true;
        nextPlayer = oldPlayer; // 交戰換序連動
      }

      if (this.phase === Models.GamePhase.MOVEMENT && data.move && nextPlayer !== oldPlayer) {
        this.lastMoves[oldPlayer] = data.move;
      }

      this.board = data.newBoard;
      this.currentPlayer = nextPlayer;
      this.phase = data.nextPhase;
      this.winner = data.winner;
      this.moveIndex = newIdx;
      this.addLog(data.message, data.capturedCount > 0 ? 'capture' : 'normal');
    },

    undoMove() {
      const last = this.history.pop();
      if (last) {
        const s = JSON.parse(last);
        this.board = s.board; this.currentPlayer = s.currentPlayer; this.phase = s.phase;
        this.moveIndex = s.moveIndex; this.lastMoves = s.lastMoves;
        this.winner = null; this.showPhaseTransition = false; this.selectedPiece = null;
      }
    },

    setHover(r: number, c: number) { this.hoverPos = { r, c }; },
    clearHover() { this.hoverPos = null; },
    addLog(msg: string, type: string) { this.logs.unshift({ msg, type }); }
  }
});