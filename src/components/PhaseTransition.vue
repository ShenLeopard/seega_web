<template>
  <Transition name="縮放淡入">
    <div v-if="isVisible" class="轉場遮罩">
      <div class="內容容器">
        <DotLottieVue
          class="背景光效"
          :src="spinningLight"
          autoplay
          loop
        />
        <div class="文字群組">
          <div class="副標題">佈 陣 完 成</div>
          <h1 class="主標題">交 戰 開 始</h1>
          <div class="裝飾線"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';

const props = defineProps({
  active: { type: Boolean, default: false },
  phase: { type: String, default: '' },
});

const emit = defineEmits(['finished']);

const spinningLight = new URL('../assets/animation/spinningLight.json', import.meta.url).href;

const isVisible = ref(false);

watch(
  () => props.active,
  (newVal) => {
    if (newVal) {
      playAnimation();
    }
  }
);

function playAnimation() {
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
    emit('finished');
  }, 2500);
}
</script>

<style scoped lang="scss">
.轉場遮罩 {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.內容容器 {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.背景光效 {
  position: absolute;
  width: 600px;
  opacity: 0.6;
  mix-blend-mode: screen;
}

.文字群組 {
  text-align: center;
  z-index: 10;
}

.副標題 {
  color: #ccc;
  font-size: 1.2rem;
  letter-spacing: 0.5rem;
  margin-bottom: 0.5rem;
  animation: 字幕滑入 0.5s ease-out both;
}

.主標題 {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(to bottom, #FFD700, #FF8F00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(255, 143, 0, 0.5));
  margin: 0;
  animation: 標題衝擊 0.6s cubic-bezier(0.17, 0.89, 0.32, 1.2) 0.2s both;
}

.裝飾線 {
  height: 2px;
  width: 0;
  background: linear-gradient(to right, transparent, #FF8F00, transparent);
  margin: 1rem auto;
  animation: 線條展開 0.8s ease-in-out 0.4s both;
}

@keyframes 標題衝擊 {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes 字幕滑入 {
  0% { transform: translateY(-20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes 線條展開 {
  0% { width: 0; }
  100% { width: 300px; }
}

.縮放淡入-enter-active, .縮放淡入-leave-active {
  transition: opacity 0.5s ease;
}
.縮放淡入-enter-from, .縮放淡入-leave-to {
  opacity: 0;
}
</style>
