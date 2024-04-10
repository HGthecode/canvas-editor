import { createApp } from 'vue'
import Modal from './InsertSignModal.vue'
import { FormControlModalProps } from './interface'
function modal(props: FormControlModalProps): any {
  const confirmInstance = createApp(Modal, {
    ...props,
    onSubmit: (res: any) => {
      props.onSubmit && props.onSubmit(res)
    },
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