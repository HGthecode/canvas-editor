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
    <span class="color-card">
      <span class="color-cell" :style="{ background: pureColor }">{{
        !pureColor ? '请选择颜色' : ''
      }}</span>
    </span>
  </a-popover>
</template>

<script setup lang="ts">
  import { PropType,ref,watchEffect } from 'vue'
  import { ColorPicker } from 'vue3-colorpicker'
  import 'vue3-colorpicker/style.css'
  import {Popover} from 'ant-design-vue';
  const APopover = Popover

  const props = defineProps({
    value: {
      type: String as PropType<string>,
      default: '',
    },
  })

  const emit = defineEmits<{
    (event: 'change', value: string | number): void
    (event: 'update:value', value: string | number): void
  }>()

  const pureColor = ref<string>('#000000')
  const gradientColor = ref('linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)')

  watchEffect(() => {
    pureColor.value = props.value
  })

  const onPureColorChange = (value:string | number) => {
    emit('update:value', value)
    emit('change', value)
  }
</script>

<style lang="css" scoped>
  .color-card {
    cursor: pointer;
    display: block;
    text-align: center;
    border-radius: 5px;
    padding: 0 5px;
    width: 100%;
    border: 1px solid #d9d9d9;
    overflow: hidden;
    
    
  }
  .color-card .iconfont {
    font-size: 12px;
  }
  .color-card .color-cell {
    display: block;
    width: 100%;
    height: 24px;
    color: #d9d9d9;
    text-align: left;
  }
  .color-picker::v-deep(.vc-colorpicker){
    /* &:deep(.vc-colorpicker) { */
      box-shadow: none;
    /* } */
  }
</style>
