<template>
  <div :class="{ disabled }">
    <i v-if="disabled" :class="['iconfont', item.icon ? item.icon : 'icon-table']"></i>
    <a-popover v-else :title="panelTitle" placement="bottom" @openChange="onPanelOpenChange">
      <template #content>
        <div class="table-panel" @mousemove="onTableMousemove" @click="onPanelClick">
          <table>
            <tbody>
              <tr v-for="(_tr, trIndex) in trNum" :key="trIndex">
                <td
                  v-for="(_tr, tdIndex) in tdNum"
                  :key="tdIndex"
                  :class="{
                    active:
                      tdIndex < currentHoverCell.colIndex && trIndex < currentHoverCell.rowIndex,
                  }"
                ></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div>
        <i :class="['iconfont', item.icon ? item.icon : 'icon-table']"></i>
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import {ref,watchEffect} from 'vue';
  import { ToolbarItemOption, ToolbarComponentProps } from '../interface/Toolbar'
  import { useEditorStore } from '../store'
  import mixin from './mixin'
  import {Popover} from 'ant-design-vue';
  const APopover = Popover

  const props = withDefaults(defineProps<ToolbarComponentProps>(), {})
  const emit = defineEmits<{
    (event: 'itemChange', value: any, item: ToolbarItemOption): void
  }>()
  const { disabled } = mixin(props)

  let trNum = 10
  let tdNum = 10
  let currentHoverCell = ref({
    colIndex: 0,
    rowIndex: 0,
  })
  let panelTitle = ref('插入表格')

  const editorStore = useEditorStore()
  let currentValue = ref<number>()

  watchEffect(() => {
    if (editorStore.rangeStyle?.font) {
      currentValue.value = editorStore.rangeStyle?.size as number
    } else {
      currentValue.value = 16
    }
  })

  const onTableMousemove = (e:any) => {
    const celSize = 16
    const rowMarginTop = 10
    const celMarginRight = 6
    const { offsetX, offsetY } = e
    const colIndex = Math.ceil(offsetX / (celSize + celMarginRight)) || 1
    const rowIndex = Math.ceil(offsetY / (celSize + rowMarginTop)) || 1
    currentHoverCell.value = {
      colIndex,
      rowIndex,
    }
    panelTitle.value = `插入 ${rowIndex}×${colIndex} 表格`
  }
  const onPanelOpenChange = (isShow:boolean) => {
    if (!isShow) {
      currentHoverCell.value = {
        colIndex: 0,
        rowIndex: 0,
      }
      panelTitle.value = `插入表格`
    }
  }

  const onPanelClick = () => {
    // console.log(currentHoverCell.value)
    if (props.item && props.item.onChange) {
      emit('itemChange', currentHoverCell.value, props.item)
    }
  }
</script>

<style lang="css" scoped>
  .table-panel {
    cursor: pointer;
  }
  .table-panel tr {
    display: flex;
    flex-wrap: nowrap;
    margin-top: 10px;
    pointer-events: none;
  }
  .table-panel tr td {
    width: 16px;
    height: 16px;
    box-sizing: border-box;
    border: 1px solid #e2e6ed;
    background: #fff;
    position: relative;
    margin-right: 6px;
    pointer-events: none;
  }
  .table-panel tr td.active {
    border: 1px solid rgba(73, 145, 242, 0.2);
    background: rgba(73, 145, 242, 0.15);
  }
</style>
