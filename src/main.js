import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

window.CESIUM_BASE_URL = '/';

createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
