import { createApp } from 'vue'
import UploadImage from './UploadImage.vue'
function modal(props: any): any {
  // 实例化组件，createApp第二个参数是props
  const confirmInstance = createApp(UploadImage, {
    ...props,
    onCancel: () => {
      props.onCancel && props.onCancel()
      unmount()
    },
  })
  // 卸载组件
  const unmount = () => {
    confirmInstance.unmount()
    document.body.removeChild(parentNode)
  }
  // 创建一个挂载容器
  const parentNode = document.createElement('div')
  document.body.appendChild(parentNode)
  // 挂载组件
  confirmInstance.mount(parentNode)

  return confirmInstance
}
export default modal
