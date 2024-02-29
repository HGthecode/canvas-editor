<template>
  <a-dropdown trigger="click">
    <div v-if="showLabel" class="dropdown-label" :title="item.name">
      <span class="text" :style="{ width: `${labelWidth}px` }">{{ currentLabel }}</span>
      <DownOutlined class="icon" />
    </div>
    <div v-else class="dropdown-icon" :title="item.name">
      <i :class="['iconfont', item.icon]"></i>
    </div>
    <template #overlay>
      <a-menu @click="onChange" class="slelct-menu">
        <a-menu-item
          v-for="option in options"
          :key="option.value"
          :class="[option.class, { active: currentValue == option.value }]"
        >
          <span v-if="!option.class" class="label">{{ option.name }}</span>

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
  import {Dropdown,Menu,MenuItem} from 'ant-design-vue';
  const ADropdown = Dropdown
  const AMenu = Menu
  const AMenuItem = MenuItem

  const props = withDefaults(defineProps<ToolbarComponentProps>(), {})
  const emit = defineEmits<{
    (event: 'itemChange', value: string | number, item: ToolbarItemOption): void
  }>()
  const options = props.item.props?.options || []
  const labelWidth = props.item.props?.labelWidth || 64
  const showLabel = props.item.props?.showLabel || false

  const editorStore = useEditorStore()
  let currentLabel = ref<string>(options[0].name)
  let currentValue = ref<string>('')

  watchEffect(() => {
    const valueField = props.item.props?.valueField
    if (valueField && editorStore.rangeStyle && editorStore.rangeStyle[valueField]) {
      const value = editorStore.rangeStyle[valueField]

      const row = options.find((p:any) => p.value === value)
      currentLabel.value = row?.name as string
      currentValue.value = value
    } else {
      currentLabel.value = options[0].name
      currentValue.value = ''
    }
  })

  const onChange = ({ key }:any) => {
    if (props.item && props.item.onChange) {
      const row = options.find((p:any) => p.value === key)
      currentLabel.value = row?.name as string
      currentValue.value = key
      emit('itemChange', key, props.item)
    }
  }
</script>

<style lang="css" scoped>
  .dropdown-label {
    padding: 0px 5px;
    border-radius: 5px;
    cursor: pointer;
    line-height: 28px;
    font-size: 14px;
    display: inline-block;
  }
  .dropdown-label .text {
    display: inline-block;
  }
  .dropdown-label .icon {
    color: rgba(0, 0, 0, 0.25);
    font-size: 12px;
  }
  .dropdown-icon {
    padding: 0px 5px;
    border-radius: 5px;
    cursor: pointer;
    line-height: 28px;
    font-size: 14px;
    display: inline-block;
  }
  .dropdown-icon:hover {
      background: #f1f1f1;
    }
</style>
