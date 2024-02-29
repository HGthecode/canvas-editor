<template>
  <a-select
    v-model:value="currentValue"
    class="toolbar-select"
    :bordered="false"
    @change="onChange"
  >
    <a-select-option v-for="font in defaultFontOptions" :key="font.value" :value="font.value">
      <span v-if="typeof font.value==='string'" :style="{ 'font-family': font.value }">{{ font.name }}</span>
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
  import {ref,watchEffect} from 'vue';
  import { ToolbarItemOption, ToolbarComponentProps } from '../interface/Toolbar'
  import { defaultFontOptions } from '../dataset/constant/Editor'
  import {Select,SelectOption} from 'ant-design-vue';
  import { SelectValue } from 'ant-design-vue/es/select';
  import {useEditorStore} from '../store';

  const ASelect = Select
  const ASelectOption = SelectOption
  const props = withDefaults(defineProps<ToolbarComponentProps>(), {})
  const emit = defineEmits<{
    (event: 'itemChange', value: SelectValue, item: ToolbarItemOption): void
  }>()

  const editorStore = useEditorStore()

  let currentValue = ref<string>()

  watchEffect(() => {
    if (editorStore.rangeStyle?.font) {
      currentValue.value = editorStore.rangeStyle?.font as string
    } else {
      currentValue.value = '宋体'
    }
  })

  const onChange = (value:SelectValue) => {
      emit('itemChange', value, props.item)
  }
</script>

<style lang="css" scoped>
  .toolbar-select {
    width: 90px;
  }
  .toolbar-select:deep(.ant-select-selector) {
    padding: 0;
  }
  .toolbar-select:deep(.ant-select-selection-item) {
    padding-inline-end: 4px;
  }
</style>
