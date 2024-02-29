<template>
  <a-dropdown trigger="click">
    <div class="dropdown-label" @click.prevent>
      {{ currentLabel }}
      <DownOutlined class="icon" />
    </div>
    <template #overlay>
      <a-menu @click="onChange" class="slelct-menu">
        <a-menu-item
          v-for="item in defaultTitleOptions"
          :key="item.level"
          :class="{ active: currentValue == item.level }"
        >
          <span :style="{ fontSize: `${item.value}px` }">{{ item.name }}</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
  import {ref,watchEffect} from 'vue';
  import { ToolbarItemOption, ToolbarComponentProps } from '../interface/Toolbar'
  import { useEditorStore } from '../store'
  import { DownOutlined } from '@ant-design/icons-vue'
  import { defaultTitleOptions } from '../dataset/constant/Editor';
  import {Dropdown,Menu,MenuItem} from 'ant-design-vue';
  const ADropdown = Dropdown
  const AMenu = Menu
  const AMenuItem = MenuItem



  const props = withDefaults(defineProps<ToolbarComponentProps>(), {})
  const emit = defineEmits<{
    (event: 'itemChange', value: string | number, item: ToolbarItemOption): void
  }>()

  const editorStore = useEditorStore()
  let currentLabel = ref<string>('正文')
  let currentValue = ref<string>('')

  watchEffect(() => {
    if (editorStore.rangeStyle?.level) {
      const row = defaultTitleOptions.find((p) => p.level === editorStore.rangeStyle?.level)
      currentLabel.value = row?.name as string
      currentValue.value = editorStore.rangeStyle?.level
    } else {
      currentLabel.value = '正文'
      currentValue.value = ''
    }
  })

  const onChange = ({ key }:any) => {
    if (props.item && props.item.onChange) {
      const row = defaultTitleOptions.find((p) => p.level === key)
      currentLabel.value = row?.name as string
      currentValue.value = key
      emit('itemChange', key, props.item)
    }
  }
</script>

<style lang="css" scoped>
  .dropdown-label {
    width: 64px;
    text-align: center;
    padding: 0px 5px;
    border-radius: 5px;
    cursor: pointer;
    line-height: 28px;
    font-size: 14px;
    display: inline-block;
    
  }
  .dropdown-label .icon {
    color: rgba(0, 0, 0, 0.25);
    font-size: 12px;
  }
</style>
