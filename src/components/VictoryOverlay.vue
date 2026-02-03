<template>
  <Transition name="漸變模糊">
    <div v-if="isActive" class="勝利遮罩">
      <div class="動畫容器">
        <DotLottieVue class="光效 旋轉光芒" :src="rotatingRay" autoplay loop />
        <DotLottieVue class="光效 閃爍亮點" :src="spinningLight" autoplay loop />
        <DotLottieVue class="獎盃主角" :src="trophy" autoplay loop />
      </div>

      <div class="資訊區域">
        <h2 class="勝利文字">{{ winnerName }} 統治了戰場！</h2>
        <div class="按鈕列">
          <button class="按鈕 再戰一回" @click="$emit('restart')">再戰一回</button>
          <button class="按鈕 關閉" @click="$emit('close')">查看棋盤</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';

const trophy = new URL('../assets/animation/Trophy.json', import.meta.url).href;
const rotatingRay = new URL('../assets/animation/RotatingRay.json', import.meta.url).href;
const spinningLight = new URL('../assets/animation/spinningLight.json', import.meta.url).href;

defineProps<{
  isActive: boolean,
  winnerName: string
}>();

defineEmits(['restart', 'close']);
</script>

<style scoped lang="scss">
.勝利遮罩 {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.動畫容器 {
  position: relative;
  width: 500px;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.光效 {
  position: absolute;
  pointer-events: none;
  mix-blend-mode: screen;
}

.旋轉光芒 { width: 140%; opacity: 0.5; }
.閃爍亮點 { width: 100%; opacity: 0.8; }

.獎盃主角 {
  width: 320px;
  filter: drop-shadow(0 0 30px rgba(255, 179, 0, 0.4));
  z-index: 10;
  animation: 獎盃浮動 3s ease-in-out infinite;
}

.資訊區域 {
  text-align: center;
  z-index: 20;
  animation: 內容上浮 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.勝利文字 {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(to bottom, #FFD700, #FF8F00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  font-style: italic;
}

.按鈕列 {
  display: flex;
  gap: 1.5rem;
}

.按鈕 {
  padding: 1rem 2.5rem;
  border-radius: 99px;
  font-weight: 900;
  border: none;
  cursor: pointer;

  &.再戰一回 {
    background: #FFB300;
    color: #1c1917;
    box-shadow: 0 8px 0 #b45309;
    &:active { transform: translateY(4px); box-shadow: 0 4px 0 #b45309; }
  }

  &.關閉 {
    background: rgba(255,255,255,0.1);
    color: white;
    border: 1px solid rgba(255,255,255,0.2);
  }
}

@keyframes 獎盃浮動 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes 內容上浮 {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

.漸變模糊-enter-active, .漸變模糊-leave-active { transition: all 0.5s ease; }
.漸變模糊-enter-from, .漸變模糊-leave-to { opacity: 0; }
</style>
