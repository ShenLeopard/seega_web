<template>
  <Transition name="fade">
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-content">
        <h2 class="title">SEEGA 開局設定</h2>
        <p class="subtitle">您操作 <span class="team-o">橘隊 (O)</span></p>
        
        <div class="actions">
          <!-- 選擇先手 -->
          <button class="btn" @click="selectOrder(true)">
            <div class="text">
              <span class="main">先手 (由我方佈陣)</span>
              <span class="sub">O 先行</span>
            </div>
          </button>

          <!-- 選擇後手 -->
          <button class="btn" @click="selectOrder(false)">
            <div class="text">
              <span class="main">後手 (由對方佈陣)</span>
              <span class="sub">X 先行</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['start-game']);
const isVisible = ref(true);

const selectOrder = (isFirst: boolean) => {
  isVisible.value = false;
  // true = O 先攻 (玩家先)
  // false = X 先攻 (對方先)
  emit('start-game', isFirst);
};
</script>

<style scoped lang="scss">
@import "../styles/variables.scss";

.modal-overlay {
  position: fixed;
  inset: 0;
  // 💡 優化 1：降低模糊程度，或在低階裝置直接改用 rgba 顏色而不模糊
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px); // 從 5px 或 8px 降到 3px
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  // 💡 優化 2：強制開啟 GPU 加速
  will-change: opacity;
}

.modal-content {
  background: #fff;
  padding: 2.5rem;
  border-radius: 2rem;
  text-align: center;
  width: 400px;
  border: 6px solid $石材色;
  // 💡 優化 3：移除不必要的陰影渲染，或簡化陰影
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  padding: 1.2rem;
  border: 2px solid #eee;
  border-radius: 1.2rem;
  background: white;
  cursor: pointer;
  
  // 💡 優化 4：將過渡時間縮短到 0.15s ~ 0.2s，並只針對特定屬性，不要用 all
  transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
  
  // 預防抖動
  backface-visibility: hidden;

  &:hover {
    // 💡 優化 5：縮放比例不要太大 (1.02 即可)，並改變顏色
    transform: translateY(-2px) scale(1.02);
    border-color: $橘隊主色;
    background-color: #fffcf0;
    
    .main { color: $橘隊主色; }
  }

  .main {
    display: block;
    font-size: 1.1rem;
    font-weight: 900;
    color: $文字色;
    transition: color 0.15s ease;
  }
  
  .sub {
    display: block;
    font-size: 0.8rem;
    color: #999;
    margin-top: 4px;
  }
}
</style>