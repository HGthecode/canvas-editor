<template>
  <div>
    <a-table
      v-if="
        (props.notDataHiddenTable == true && props.data && props.data.length > 0) ||
        props.notDataHiddenTable !== true
      "
      bordered
      :pagination="false"
      size="small"
      :data-source="props.data"
      :columns="props.columns"
      :scroll="props.scroll"
    >
      <template #bodyCell="{ column, text, record }">
        <div v-if="column.itemRender" class="edit-item-wraper">
          <template v-if="column.itemRender.name === 'number'">
            <a-input-number
              class="edit-item"
              :value="text"
              v-bind="column.itemRender.props"
              @change="onCellChange($event, column, record)"
              size="small"
            />
          </template>
          <template v-else-if="column.itemRender.name === 'auto-complete'">
            <!-- <a-input-number
              class="edit-item"
              :value="text"
              v-bind="column.itemRender.props"
              @change="onCellChange($event, column, record)"
            /> -->
            <a-auto-complete
              class="edit-item"
              :value="text"
              size="small"
              v-bind="column.itemRender.props"
              @change="onCellChange($event, column, record)"
              @select="onAutoCompleteSelect($event, column, record)"
            />
          </template>
          <template v-else-if="column.itemRender.name === 'select'">
            <a-select
              class="edit-item"
              :value="text"
              size="small"
              showSearch
              allowClear
              v-bind="column.itemRender.props"
              @change="onCellChange($event, column, record)"
            />
          </template>
          <template v-else-if="column.itemRender.name === 'checkbox'">
            <a-checkbox
              class="edit-item"
              :checked="text"
              v-bind="column.itemRender.props"
              @change="onCellChange($event, column, record)"
            />
          </template>
          <template v-else-if="column.itemRender.name === 'delete-button'">
            <a-button
              type="link"
              v-if="record.require !== true"
              danger
              size="small"
              @click="onDeleteRow(record)"
              ><DeleteOutlined
            /></a-button>
            <span else></span>
          </template>
          <template v-else-if="column.itemRender.name === 'check-status'">
            <CheckOutlined v-if="text && text == 1" />
          </template>
          <template
            v-else-if="column.itemRender.name === 'input' || column.itemRender.name === 'auto'"
          >
            <a-input
              class="edit-item"
              :value="text"
              size="small"
              v-bind="column.itemRender.props"
              @change="onCellChange($event, column, record)"
            />
          </template>
          <template v-else>
            <div style="text-align: initial">{{ text }}</div>
          </template>
        </div>
      </template>
    </a-table>

    <a-button v-if="props.isAdd" class="mt-xs" size="small" @click="onAddRow">+ 添加</a-button>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'EditTable',
  }
</script>

<script setup lang="ts">
  import {PropType} from 'vue';
  import { ColumnItem, EditTableProps } from './types'
  import { DeleteOutlined, CheckOutlined } from '@ant-design/icons-vue'
  import {Button,Table,Select,Checkbox,Input,InputNumber,AutoComplete} from 'ant-design-vue';

const AButton = Button;
const ATable = Table;
const ASelect = Select;
const ACheckbox = Checkbox;
const AInput = Input;
const AInputNumber = InputNumber;
const AAutoComplete = AutoComplete;

  // import { ObjectType } from '/#/index'

  // interface Props {
  //   columns: ColumnItem[]
  //   data: any
  //   isAdd?: boolean
  //   scroll?: ObjectType<string>
  // }

  // const props = withDefaults(defineProps<EditTableProps>(), {
  //   isAdd: false,
  //   notDataHiddenTable: false,
  // })
  const props = defineProps({
    isAdd: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object as PropType<any>,
      default: [],
    },
    columns: {
      type: Array as PropType<ColumnItem[]>,
      default: () => {
        return []
      },
    },
    scroll: {
      type: Object as PropType<any>,
      default: () => {
        return {}
      },
    },
    notDataHiddenTable: {
      type: Boolean,
      default: false,
    },
  })

  console.log(props.notDataHiddenTable)

  const emit = defineEmits<{
    (event: 'deleteRow', record: any): void
    (event: 'addRow'): void
  }>()

  function onCellChange(e: any, column: ColumnItem, record: any) {
    let value = ''
    let name = column.itemRender && column.itemRender.name ? column.itemRender.name : ''
    switch (name) {
      case 'input':
        value = e.target.value
        break
      case 'checkbox':
        value = e.target.checked
        break
      case 'auto':
        value = e.target.value
        break
      default:
        value = e
        break
    }
    record[column.dataIndex] = value
  }
  function onAutoCompleteSelect(e: any, column: ColumnItem, record: any) {
    console.log(e, column, record)
  }
  const onDeleteRow = (record: any) => {
    emit('deleteRow', record)
  }
  const onAddRow = () => {
    emit('addRow')
  }

  interface UploadFileState {
    name: string
  }
  function fileBeforeUpload(file: UploadFileState, record: any, column: any): void {
    if (record.type === 'files' && record[column.dataIndex] && record[column.dataIndex].length) {
      record[column.dataIndex].push(file)
    } else {
      record[column.dataIndex] = [file]
    }
  }
  function fileHandleRemove(file: UploadFileState, record: any, column: any): void {
    let fileList = record[column.dataIndex]
    const index = fileList.indexOf(file)
    const newFileList = fileList.slice()
    newFileList.splice(index, 1)
    record[column.dataIndex] = newFileList
  }
</script>

<style lang="css" scoped>
  .edit-item-wraper {
    text-align: center;
    /* &:deep(.ant-upload-list-item-name) {
      width: calc(100% - 40px);
    } */
  }

  .edit-item-wraper::v-deep(.ant-upload-list-item-name){
    width: calc(100% - 40px);
  }
  .edit-item {
    text-align: left;
    /* &:not(.ant-checkbox-wrapper) {
      width: 100%;
    } */
  }
  .edit-item::v-deep(.ant-checkbox-wrapper){
    width: 100%;
  }
</style>
