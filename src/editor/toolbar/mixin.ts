import { ref,watch } from 'vue'
import { ToolbarComponentProps } from '../interface/Toolbar'
import { useEditorStore } from '../store'

export default function (props: ToolbarComponentProps) {
  const disabled = ref<boolean>(false)
  const active = ref<boolean>(false)

  const editorStore = useEditorStore()
  watch(
    ()=>editorStore.rangeStyle,
    ()=>{
      if (props.item.onDisabled) {
        disabled.value = props.item.onDisabled(editorStore.rangeStyle) ? true : false
      }
      if (props.item.onActive) {
        active.value = props.item.onActive(editorStore.rangeStyle) ? true : false
      }
    }
  )
  return {
    disabled,
    active
  }
}
