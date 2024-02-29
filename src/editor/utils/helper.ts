import {  IElement } from '../index'
// import { FormModalData } from '../components/DataForm/interface'
// import { useEditorOutsideStore } from '/@/store/modules/editor'

//获取屏幕分辨率DPI
export const getDpi = () => {
  for (let i = 56; i < 2000; i++) {
    if (matchMedia('(max-resolution: ' + i + 'dpi)').matches === true) {
      return i
    }
  }
  return 56
}

// 保留2位小数,截取掉后面的数字
export const toTwoFixed = (num:string) => {
  return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))
}

// 获取编辑器所有表单控件的参数
export const getEditorFields = (editorData: IElement[] = []) => {
//   if (!(editorData && editorData.length)) {
//     const editorStore = useEditorOutsideStore()
//     const json = editorStore.editor?.command.getValue()
//     editorData = json?.data.main as IElement[]
//   }
//   const fields: string[] = []
//   for (let i = 0; i < editorData.length; i++) {
//     const item = editorData[i]
//     if (item.type === ElementType.CONTROL && item.control?.extension) {
//       const extension: FormModalData = item.control?.extension
//       if (extension.form && extension.form.field) {
//         fields.push(extension.form.field)
//       }
//     }
//   }
  console.log(editorData)
}

export const getNewFieldName = () => {
  return 'field_' + Date.now().toString() + Math.floor(Math.random() * 10)
}

export const createRandKey = (): string => {
  return new Date().getTime() + Math.ceil(Math.random() * 1000) + ''
}

export const convertSvgElementToBase64 = (svgElement: HTMLElement | SVGSVGElement) => {
  return `data:image/svg+xml;base64,${btoa(decodeURIComponent(svgElement.outerHTML))}`
}
