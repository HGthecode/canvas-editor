<template>
  <div>
    <a-dropdown>
      <div class="toolbar-button" @click.prevent>
        <i class="iconfont icon-add"></i>
        表单控件
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item
          v-for="(item, index) in options" :key="index"
          @click="onItemClick(item)"
          >
            <div class="flex">
              <div><i :class="['iconfont',item.icon]"></i></div>
              <div class="flex-item">{{item.name}}</div>
            </div>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
  import {Dropdown,Menu,MenuItem} from 'ant-design-vue';
  const ADropdown = Dropdown
  const AMenu = Menu
  const AMenuItem = MenuItem
  import { ToolbarComponentProps,ToolbarComponentEmit } from '../interface/Toolbar'
  const props = withDefaults(defineProps<ToolbarComponentProps>(), {})
  const options = props.item.props?.options || []
  const emit = defineEmits<ToolbarComponentEmit>()
  function onItemClick(item:any){
    emit('itemClick',item)
  }
</script>

