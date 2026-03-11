import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';



const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate); // 注册持久化插件

// 全局注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 挂载 Element Plus 和路由
app.use(ElementPlus)
app.use(pinia);
app.use(router)

app.mount('#app')