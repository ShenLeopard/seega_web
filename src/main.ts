import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import PhaseTransition from './components/PhaseTransition.vue'
import VictoryOverlay from './components/VictoryOverlay.vue'
import GameSetup from './components/GameSetup.vue'

const app = createApp(App)
app.component('PhaseTransition', PhaseTransition)
app.component('phase-transition', PhaseTransition)
app.component('VictoryOverlay', VictoryOverlay)
app.component('victory-overlay', VictoryOverlay)
app.component('GameSetup', GameSetup)
app.component('game-setup', GameSetup)

app.use(createPinia())
app.mount('#app')