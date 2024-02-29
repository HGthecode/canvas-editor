<template>
  <div :class="['button-picker', mode]">
    <div
      v-for="item in options"
      :key="item.value"
      :class="['button-picker-item', { active: state.currentValue == item.value }]"
      @click="onClick(item)"
    >
      <div v-if="item.icon || item.image" class="avatar">
        <i
          v-if="item.icon && item.icon.indexOf('icon-') > -1"
          :class="['icon', 'iconfont', item.icon]"
        ></i>
        <a-avatar v-else-if="item.image" :src="item.image" shape="square" />
      </div>
      <span v-if="item.label" class="label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {reactive} from 'vue';
  import { ButtonPickerProps, ButtonPickerOptionItem } from './interface'
  import {Avatar} from 'ant-design-vue';
  const AAvatar =Avatar


  const props = withDefaults(defineProps<ButtonPickerProps>(), {
    mode: 'check',
    multiple: false,
  })
  const emit = defineEmits<{
    (event: 'change', value: string | number): void
    (event: 'update:value', value: string | number): void
  }>()

  const state = reactive<{
    currentValue: string | number
  }>({
    currentValue: '',
  })

  state.currentValue = props.value
  const onClick = (item: ButtonPickerOptionItem) => {
    state.currentValue = item.value
    emit('update:value', state.currentValue)
    emit('change', state.currentValue)
  }
</script>

<style lang="css" scoped>
  .button-picker {
    display: inline-block;
    
  }
  .button-picker-item {
      margin-right: 10px;
      margin-bottom: 10px;
      display: inline-block;
      cursor: pointer;
  }
  .button-picker.button .button-picker-item {
    border: 1px solid #ddd;
    padding: 4px 15px;
    border-radius: 6px;
  }
  .button-picker.check {
    text-align: center;
  }
  .button-picker.check .avatar {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .button-picker.check .avatar .icon {
    padding: 10px;
  }
  .button-picker.check .button-picker-item.active .avatar {
    border: 1px solid #1677ff;
    position: relative;
  }
  .button-picker.check .button-picker-item.active .avatar::before {
    content: '\e712';
    font-family: 'iconfont' !important;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    position: absolute;
    bottom: 0;
    right: -1px;
    line-height: 11px;
    color: #1677ff;
  }
  .button-picker.check .button-picker-item.active .avatar .label {
    color: #1677ff;
  }
</style>
