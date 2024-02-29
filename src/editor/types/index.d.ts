// 部分浏览器canvas上下文支持设置以下属性
interface CanvasRenderingContext2D {
  letterSpacing: string
  wordSpacing: string
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}