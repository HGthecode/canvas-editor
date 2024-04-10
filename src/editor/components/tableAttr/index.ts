import { createApp } from 'vue'
import TableAttrModal from './TableAttrModal.vue'
import TableRowAttrModal from './TableRowAttrModal.vue'
import TableColAttrModal from './TableColAttrModal.vue'


import { TableAttrModalProps } from './interface'
export const  tableAttrModal = (props: TableAttrModalProps): any =>{
  const confirmInstance = createApp(TableAttrModal, {
    ...props,
    onSubmit: (res: any) => {
      props.onSubmit && props.onSubmit(res)
    },
    onCancel: () => {
      props.onCancel && props.onCancel()
      unmount()
    },
  })
  const unmount = () => {
    confirmInstance.unmount()
    document.body.removeChild(parentNode)
  }
  const parentNode = document.createElement('div')
  document.body.appendChild(parentNode)
  confirmInstance.mount(parentNode)
  return confirmInstance
}


export const  tableRowAttrModal = (props: TableAttrModalProps): any =>{
  const confirmInstance = createApp(TableRowAttrModal, {
    ...props,
    onSubmit: (res: any) => {
      props.onSubmit && props.onSubmit(res)
    },
    onCancel: () => {
      props.onCancel && props.onCancel()
      unmount()
    },
  })
  const unmount = () => {
    confirmInstance.unmount()
    document.body.removeChild(parentNode)
  }
  const parentNode = document.createElement('div')
  document.body.appendChild(parentNode)
  confirmInstance.mount(parentNode)
  return confirmInstance
}


export const  tableColAttrModal = (props: TableAttrModalProps): any =>{
  const confirmInstance = createApp(TableColAttrModal, {
    ...props,
    onSubmit: (res: any) => {
      props.onSubmit && props.onSubmit(res)
    },
    onCancel: () => {
      props.onCancel && props.onCancel()
      unmount()
    },
  })
  const unmount = () => {
    confirmInstance.unmount()
    document.body.removeChild(parentNode)
  }
  const parentNode = document.createElement('div')
  document.body.appendChild(parentNode)
  confirmInstance.mount(parentNode)
  return confirmInstance
}
