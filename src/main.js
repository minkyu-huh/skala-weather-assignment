import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElAlert, ElButton, ElCard, ElEmpty, ElInput, ElSkeleton, ElTable, ElTableColumn, ElTag } from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 실제 화면에서 사용하는 Element Plus 컴포넌트만 등록해 전체 라이브러리가 번들에 포함되는 것을 줄인다.
const elementComponents = [ElAlert, ElButton, ElCard, ElEmpty, ElInput, ElSkeleton, ElTable, ElTableColumn, ElTag]
elementComponents.forEach((component) => {
  app.component(component.name, component)
})

app.mount('#app')
