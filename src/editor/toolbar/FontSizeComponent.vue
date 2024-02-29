<template>
  <a-select
    v-model:value="currentValue"
    class="toolbar-select"
    :bordered="false"
    @change="onChange"
  >
    <a-select-option v-for="item in defaultFontSizeOptions" :key="item.value" :value="item.value">
      <span>{{ item.name }}</span>
    </a-select-option>
  </a-select>
</template>


<script setup lang="ts">
  import {ref,watchEffect} from 'vue';
  import { ToolbarItemOption, ToolbarComponentProps } from '../interface/Toolbar'
  import {useEditorStore} from '../store';
  import { defaultFontSizeOptions } from '../dataset/constant/Editor';
  import {Select,SelectOption} from 'ant-design-vue';
  const ASelect = Select
  const ASelectOption = SelectOption
  const props = withDefaults(defineProps<ToolbarComponentProps>(), {})
  const emit = defineEmits<{
    (event: 'itemChange', value: string | number, item: ToolbarItemOption): void
  }>()

  const editorStore = useEditorStore()
  let currentValue = ref<number>()

  watchEffect(() => {
    if (editorStore.rangeStyle?.font) {
      currentValue.value = editorStore.rangeStyle?.size as number
    } else {
      currentValue.value = 16
    }
  })

  const onChange = (value:string) => {
    if (props.item && props.item.onChange) {
      emit('itemChange', value, props.item)
    }
  }
</script>

<style lang="css" scoped>
  .toolbar-select {
    width: 64px;
  }
  .toolbar-select:deep(.ant-select-selector) {
    padding: 0;
  }
  .toolbar-select:deep(.ant-select-selection-item) {
    padding-inline-end: 4px;
  }
</style>
