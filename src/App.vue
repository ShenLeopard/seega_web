<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "./stores/gameStore";

const formatPos = (r: number, c: number) => {
  const row = String.fromCharCode(65 + r); // 0->A, 1->B...
  const col = c + 1; // 0->1, 1->2...
  return `${row}${col}`;
};

const selectedCoord = computed(() => {
  if (!store.selectedPiece) return "";
  return formatPos(store.selectedPiece.r, store.selectedPiece.c);
});
const store = useGameStore();
const isCenter = (r: number, c: number) => r === 2 && c === 2;

const winnerDisplay = computed(() => {
  if (store.winner === "O") return "橘隊 (O)";
  if (store.winner === "X") return "黑隊 (X)";
  return "";
});

const onGameStart = (isFirst: boolean) => store.initGame(isFirst);
const handleRestart = () => store.prepareNewGame();
</script>

<template>
  <div class="遊戲容器">
    <game-setup v-if="store.isSetupMode" @start-game="onGameStart" />

    <header class="頁首">
      <h1 class="主標題">SEEGA</h1>
      <div class="階段標籤" :class="store.phase">
        ● {{ store.phase === "PLACEMENT" ? "佈陣中" : store.phase === "STUCK_REMOVAL" ? "受困解圍" : "對戰中" }}
      </div>
    </header>

    <main class="遊戲主體">
      <!-- 橘隊 (O) -->
      <aside class="側邊欄">
        <div class="玩家卡片 橘隊" :class="{ 啟用: store.currentPlayer === 'O' }">
          <div class="頭像 橘色棋子"></div>
          <div class="資訊區">
            <h3>橘隊 (O)</h3>
            <p>MY TEAM</p>
          </div>
          <button @click="store.triggerAi"
            :disabled="store.isAiProcessing || !!store.winner || store.currentPlayer !== 'O'">
            {{ store.isAiProcessing && store.currentPlayer === "O" ? "思考中..." : "AI 代打" }}
          </button>
        </div>
      </aside>

      <!-- 中央棋盤 -->
      <section class="中央區">
        <div class="棋盤外框">
          <div class="橫向座標列">
            <div v-for="n in 5" :key="'h-' + n" class="座標數字">{{ n }}</div>
          </div>
          <div class="棋盤核心行">
            <div class="縱向座標列">
              <div v-for="r in 5" :key="'v-' + r" class="座標數字">
                {{ String.fromCharCode(64 + r) }}
              </div>
            </div>
            <div class="網格系統">
              <template v-for="(row, r) in store.board" :key="'row-' + r">
                <div v-for="(cell, c) in row" :key="'cell-' + r + '-' + c" class="棋格" :class="{
                  '中心點': isCenter(r, c),
                  '被選中': store.selectedPiece?.r === r && store.selectedPiece?.c === c,
                  '可移動提示': store.isAdjacentEmpty(r, c),
                  '可移除目標': store.phase === 'STUCK_REMOVAL' && store.isOpponent(r, c)
                }" @mouseenter="store.setHover(r, c)" @mouseleave="store.clearHover()"
                  @click="store.handleCellClick(r, c)">

                  <!-- 實體棋子 -->
                  <div v-if="cell" class="棋子" :class="cell === 'O' ? '橘棋' : '黑棋'"></div>
                  <div v-else-if="isCenter(r, c)" class="圖示">⚓</div>

                  <!-- 改進後的預覽容器 (絕對定位在棋格內) -->
                  <div class="預覽容器">
                    <!-- 1. 佈陣階段：滑鼠指到的格子顯示透明棋子 -->
                    <div
                      v-if="store.phase === 'PLACEMENT' && !cell && store.hoverPos?.r === r && store.hoverPos?.c === c && !isCenter(r, c)"
                      class="透明預覽" :class="store.currentPlayer === 'O' ? '橘預覽' : '黑預覽'">
                    </div>
                    <!-- 2. 移動階段：選中棋子後，周圍空格顯示透明路徑提示 -->
                    <div v-if="store.phase === 'MOVEMENT' && !cell && store.isAdjacentEmpty(r, c)" class="透明預覽"
                      :class="store.currentPlayer === 'O' ? '橘預覽' : '黑預覽'">
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <button class="悔棋按鈕" :class="{ 可用: store.canUndo }" @click="store.undoMove" :disabled="!store.canUndo">
          ↶ 撤銷上一步 (UNDO)
        </button>
      </section>

      <!-- 黑隊 (X) -->
      <aside class="側邊欄">
        <div class="玩家卡片 黑隊" :class="{ 啟用: store.currentPlayer === 'X' }">
          <div class="頭像 黑色棋子"></div>
          <div class="資訊區">
            <h3>黑隊 (X)</h3>
            <p>OPPONENT</p>
          </div>
          <button @click="store.triggerAi"
            :disabled="store.isAiProcessing || !!store.winner || store.currentPlayer !== 'X'">
            {{ store.isAiProcessing && store.currentPlayer === "X" ? "思考中..." : "AI 行動" }}
          </button>
        </div>
        <div class="紀錄面板">
          <h4 class="紀錄標題">對戰紀錄</h4>
          <div class="列表">
            <div v-for="(log, i) in store.logs" :key="i" class="條目" :class="log.type">{{ log.msg }}</div>
          </div>
        </div>
      </aside>
    </main>

    <phase-transition :active="store.showPhaseTransition" @finished="store.showPhaseTransition = false" />
    <victory-overlay :is-active="!!store.winner" :winner-name="winnerDisplay" @restart="handleRestart"
      @close="store.winner = null" />
  </div>
</template>

<style lang="scss">
@use "sass:color";
@use "./styles/variables.scss" as *;

// 1. 基礎佈局與背景
.遊戲容器 {
  background-color: $背景色;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: "PingFang TC", "Microsoft JhengHei", sans-serif;
  box-sizing: border-box;
}

.頁首 {
  text-align: center;
  margin-bottom: 2.5rem;

  .主標題 {
    color: $文字色;
    font-size: 3.5rem;
    font-weight: 900;
    letter-spacing: 0.8rem;
    margin: 0;
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .階段標籤 {
    display: inline-block;
    padding: 0.4rem 1.5rem;
    background: white;
    border-radius: 99px;
    font-weight: 900;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    margin-top: 1rem;
    font-size: 0.9rem;

    &.PLACEMENT {
      color: $橘隊主色;
    }

    &.MOVEMENT {
      color: $黑隊主色;
    }

    &.STUCK_REMOVAL {
      color: #ef4444;
      background: #fff1f2;
      animation: blink 1s infinite;
    }
  }
}

.遊戲主體 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 3.5rem;
  width: 100%;
  max-width: 1400px;
}

.側邊欄 {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// 2. 玩家卡片與按鈕
.玩家卡片 {
  background: white;
  padding: 2rem;
  border-radius: 2.5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
  transition: all $過渡動畫;
  opacity: 0.35;
  border-top: 10px solid transparent;
  transform: scale(0.96);

  &.啟用 {
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

    &.橘隊 {
      border-color: $橘隊主色;
    }

    &.黑隊 {
      border-color: $黑隊主色;
    }
  }

  .頭像 {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    border: 4px solid white;
    margin-bottom: 1rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .橘色棋子 {
    background: $橘隊主色;
  }

  .黑色棋子 {
    background: $黑隊主色;
  }

  .資訊區 {
    h3 {
      color: $文字色;
      margin: 0;
      font-size: 1.4rem;
      font-weight: 900;
    }

    p {
      font-size: 0.75rem;
      color: #999;
      margin: 0.2rem 0 0 0;
      letter-spacing: 1px;
    }
  }

  .狀態提示 {
    margin-top: 1.2rem;
    font-size: 0.85rem;
    font-weight: bold;
    color: $橘隊主色;
    background: color.adjust($橘隊主色, $lightness: 45%);
    padding: 0.4rem;
    border-radius: 0.6rem;
    text-align: center;
  }

  button {
    width: 100%;
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 1.2rem;
    border: none;
    font-weight: 900;
    font-size: 1rem;
    cursor: pointer;
    background: #eee;
    color: #888;
    transition: all 0.2s ease;

    &:not(:disabled) {
      background: $文字色;
      color: white;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        filter: brightness(1.1);
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none; // 🛑 物理鎖死，點擊穿透
      filter: grayscale(100%);
    }
  }
}

// 3. 棋盤與座標核心樣式
.中央區 {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.棋盤外框 {
  background: $石材色;
  padding: 35px;
  border-radius: 4.5rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.橫向座標列 {
  display: flex;
  padding-left: 50px; // 預留空間給左側座標
  margin-bottom: 12px;

  .座標數字 {
    width: $棋格大小;
    margin-right: $網格間距;
    text-align: center;
    color: rgba(white, 0.6);
    font-weight: 900;
    font-size: 1.1rem;
  }
}

.棋盤核心行 {
  display: flex;
  flex-direction: row;
}

.縱向座標列 {
  display: flex;
  flex-direction: column;
  width: 40px;
  margin-right: 10px;

  .座標數字 {
    height: $棋格大小;
    margin-bottom: $網格間距;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(white, 0.6);
    font-weight: 900;
    font-size: 1.1rem;
  }
}

.網格系統 {
  display: grid;
  grid-template-columns: repeat(5, $棋格大小);
  grid-template-rows: repeat(5, $棋格大小);
  gap: $網格間距;
  background-color: $網格色;
  padding: $網格間距;
  border-radius: 2.5rem;
}

// 4. 棋格互動樣式
.棋格 {
  width: $棋格大小;
  height: $棋格大小;
  background-color: $棋格色;
  border-radius: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: color.adjust($棋格色, $lightness: 4%);
  }

  &.中心點 {
    background-color: color.adjust($棋格色, $lightness: -10%);
    cursor: default;

    .圖示 {
      opacity: 0.15;
      font-size: 2.2rem;
      color: $文字色;
    }
  }

  &.被選中 {
    background-color: white !important;
    outline: 6px solid $橘隊主色;
    outline-offset: -6px;
    z-index: 10;
    transform: scale(1.04);
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.5);
  }

  &.提示 {
    background-color: rgba(white, 0.25);

    &::before {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      background: rgba(white, 0.5);
      border-radius: 50%;
    }
  }

  &.可移除目標 {
    outline: 5px dashed #ef4444;
    background-color: #fee2e2;
    cursor: crosshair;

    &:hover {
      background-color: #fca5a5;
    }
  }
}

// 5. 棋子實體與預覽
.棋子 {
  width: 82%;
  height: 82%;
  border-radius: 50%;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  z-index: 5;

  &.橘棋 {
    background: linear-gradient(135deg, $橘隊主色, color.adjust($橘隊主色, $lightness: -15%));
  }

  &.黑棋 {
    background: linear-gradient(135deg, #444, $黑隊主色);
  }
}

.預覽容器 {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

.透明預覽 {
  width: 72%;
  height: 72%;
  border-radius: 50%;
  opacity: 0.45;
  animation: previewPulse 1.8s infinite ease-in-out;

  &.橘預覽 {
    background-color: $橘隊主色;
  }

  &.黑預覽 {
    background-color: $黑隊主色;
  }
}

@keyframes previewPulse {

  0%,
  100% {
    transform: scale(0.88);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.0);
    opacity: 0.55;
  }
}

// 6. 紀錄面板與滑桿
.紀錄面板 {
  background: white;
  border-radius: 2.5rem;
  padding: 1.8rem;
  height: 420px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;

  .紀錄標題 {
    color: #999;
    font-size: 0.85rem;
    font-weight: 900;
    border-bottom: 2px solid #f3f4f6;
    padding-bottom: 0.8rem;
    margin-bottom: 0.8rem;
    flex-shrink: 0;
  }

  .列表 {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 10px;

      &:hover {
        background: #ccc;
      }
    }

    .條目 {
      font-size: 0.85rem;
      padding: 0.7rem 0.9rem;
      border-left: 5px solid #eee;
      background: #fafafa;
      margin-bottom: 0.5rem;
      border-radius: 0 10px 10px 0;
      color: #666;
      line-height: 1.5;

      &.capture {
        border-left-color: #ef4444;
        background: #fff1f2;
        color: #b91c1c;
        font-weight: bold;
      }

      &.info {
        border-left-color: $橘隊主色;
        background: #fffbeb;
      }
    }
  }
}

// 7. 悔棋按鈕
.悔棋按鈕 {
  width: 100%;
  margin-top: 2.5rem;
  padding: 1.3rem;
  background: white;
  border: 3px solid color.adjust($石材色, $lightness: 20%);
  color: color.adjust($石材色, $lightness: 20%);
  border-radius: 1.8rem;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.4;
  transition: all 0.3s ease;

  &.可用 {
    opacity: 1;
    background: white;
    color: $橘隊主色;
    border: 3px solid $橘隊主色;
    box-shadow: 0 10px 25px rgba($橘隊主色, 0.15);

    &:hover {
      transform: translateY(-3px);
      background: $橘隊主色;
      color: white;
    }
  }

  &:disabled {
    cursor: not-allowed;
  }
}

@keyframes blink {
  50% {
    opacity: 0.6;
  }
}
</style>