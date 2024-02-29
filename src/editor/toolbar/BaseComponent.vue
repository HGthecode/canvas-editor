<template>
  <div @click="onClick" :class="[{ disabled },{active}]">
    <i :class="['iconfont', item.icon]"></i>
  </div>
</template>

<script setup lang="ts">
  import { ToolbarComponentProps, ToolbarComponentEmit } from '../interface/Toolbar'
  import mixin from './mixin'

  const props = withDefaults(defineProps<ToolbarComponentProps>(), {})
  const emit = defineEmits<ToolbarComponentEmit>()
  const onClick = () => {
    if (props.item && props.item.onClick && disabled.value === false) {
      emit('itemClick', props.item)
    }
  }
  const { disabled,active } = mixin(props)
</script>
