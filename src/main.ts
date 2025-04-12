import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import '@/assets/main.css'

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 按照正确的顺序使用插件
app.use(pinia) // Pinia 必须在 router 之前注册
app.use(router)

app.mount('#app') 