<template>
  <div
    v-if="state.isVisible"
    class="drag-window"
    :style="{
      top: `${state.top}px`,
      left: `${state.left}px`,
      width: `${props.width}px`,
    }"
  >
    <div class="header">
      <div class="drag-window-title">{{ title }}</div>
      <div class="close" @click="onClose">
        <CloseOutlined />
      </div>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PropType,reactive,watchEffect,onMounted } from 'vue'
  import { CloseOutlined } from '@ant-design/icons-vue'

  interface Position {
    top?: number
    left?: number | 'left' | 'center' | 'right'
  }
  const props = defineProps({
    title: {
      type: String as PropType<string>,
      default: '',
    },
    width: {
      type: Number as PropType<number>,
      default: 500,
    },
    visible: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    position: {
      type: Object as PropType<Position>,
      default: () => {},
    },
  })

  const emit = defineEmits<{
    (event: 'close'): void
    (event: 'update:visible', visible: boolean): void
  }>()

  const state = reactive<{
    isVisible: boolean
    left: number
    top: number
  }>({
    isVisible: false,
    left: window.innerWidth / 2 - props.width / 2,
    top: 100,
  })

  if (props.position && props.position.left) {
    if (props.position.left === 'left') {
      state.left = 0
    } else if (props.position.left === 'center') {
      state.left = window.innerWidth / 2 - props.width / 2
    } else if (props.position.left === 'right') {
      state.left = window.innerWidth - props.width
    } else {
      state.left = props.position.left
    }
  }
  if (props.position && props.position.top) {
    state.top = props.position.top
  }

  watchEffect(() => {
    state.isVisible = props.visible
  })

  function onWindowDrag() {
    let header = document.querySelector<HTMLDivElement>('.drag-window-title')!
    let model = document.querySelector<HTMLDivElement>('.drag-window')!
    header.addEventListener('mouseover', () => {
      header.style.cursor = 'move'
    })
    header.addEventListener('mousedown', function (e) {
      var x = e.pageX - model.offsetLeft
      var y = e.pageY - model.offsetTop
      document.addEventListener('mousemove', move)
      function move(e:any) {
        let top = e.pageY - y
        let left = e.pageX - x
        if (top < 0) {
          top = 0
        }
        if (left < 0) {
          left = 0
        }
        model.style.top = top + 'px'
        model.style.left = left + 'px'
      }
      header.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', move)
      })
    })
  }

  function onClose() {
    emit('update:visible', false)
    emit('close')
  }

  onMounted(() => {
    setTimeout(() => {
      onWindowDrag()
    }, 100)
  })
</script>

<style lang="css" scoped>
  .drag-window {
    position: fixed;
    border-radius: 5px;
    background: #fff;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
    z-index: 999;
  }
  .drag-window .header {
    line-height: 32px;
    display: flex;
    background: #f1f1f1;
    padding: 3px 10px 3px 20px;
  }
  .drag-window .header .drag-window-title {
    flex: 1;
  }
  .drag-window .header  .close {
    padding: 0 10px;
  }
  .drag-window .content {
      padding: 20px;
    }
</style>
