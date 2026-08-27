import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages에서는 저장소 이름이 주소 중간에 들어가므로 배포 경로를 별도로 전달한다.
  base: process.env.VITE_BASE_PATH || '/',
  // Vue DevTools는 개발 서버에서만 사용하고 제출용 빌드에서는 제외한다.
  plugins: command === 'serve' ? [vue(), vueDevTools()] : [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // [커스텀 추가] 로컬 개발 서버(Dev Server) 속성 제어
  server: {
    port: 3000, // 개발 서버의 네트워크 포트를 3000번으로 고정 명세
    open: true, // 프로세스 기동(npm run dev) 시 기본 웹 브라우저를 자동 실행
  },
  // [커스텀 추가 2] 컴파일 완료된 산출물(Production Build) 사양 제어
  build: {
    outDir: 'dist', // 최종 정적 리소스(HTML, JS, CSS)가 저장될 출력 디렉토리명 지정
  },
}))
