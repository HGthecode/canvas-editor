<template>
  <a-popover title="颜色选择" trigger="click">
    <template #content>
      <div class="color-picker">
        <color-picker
          is-widget
          format="hex"
          disableAlpha
          v-model:pureColor="pureColor"
          v-model:gradientColor="gradientColor"
          @pureColorChange="onPureColorChange"
        />
      </div>
    </template>
    <div class="color-card">
      <i :class="['iconfont', item.icon]"></i>
      <span class="color-cell" :style="{ background: pureColor }"></span>
    </div>
  </a-popover>
</template>

<script setup lang="ts">
  import {ref,watchEffect} from 'vue';
  import { ToolbarItemOption, ToolbarComponentProps } from '../interface/Toolbar'
  import {useEditorStore} from '../store';
  import { ColorPicker } from 'vue3-colorpicker'
  import 'vue3-colorpicker/style.css'
  import {Popover} from 'ant-design-vue';
  const APopover = Popover

  const props = withDefaults(defineProps<ToolbarComponentProps>(), {
    // valueField: 'color',
  })
  const emit = defineEmits<{
    (event: 'itemChange', value: string | number, item: ToolbarItemOption): void
  }>()
  const visible = ref<boolean>(false)

  const editorStore = useEditorStore()

  const pureColor = ref<string>('#000000')
  const gradientColor = ref('linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)')

  watchEffect(() => {
    if (
      editorStore.rangeStyle &&
      props.item.props?.valueField &&
      editorStore.rangeStyle[props.item.props.valueField]
    ) {
      pureColor.value = editorStore.rangeStyle[props.item.props.valueField] as string
    } else {
      pureColor.value = props.item.props?.defaultValue
    }
  })

  const onPureColorChange = (value:string) => {
    if (props.item && props.item.onChange) {
      emit('itemChange', value, props.item)
    }
    visible.value = false
  }
</script>

<style lang="css" scoped>
  .color-card {
    cursor: pointer;
    display: inline-block;
    text-align: center;
    padding: 3px 5px;
    border-radius: 5px;
    line-height: 14px;
    padding-top: 6px;
  }
  .color-card .iconfont {
    font-size: 12px;
  }
  .color-card .color-cell {
    display: block;
    width: 100%;
    height: 4px;
    border:1px solid #ddd;
  }
  .color-picker :deep(.vc-colorpicker) {
    box-shadow: none;
  }
</style>
