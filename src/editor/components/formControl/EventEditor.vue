<template>
  <div class="event-editor">
    <div class="event-editor-content">
      <div v-for="item in eventList" :key="item.id" class="event-item">
        <div class="form-item">
          <div class="form-item-label tr">事件</div>
          <div class="form-item-content">
            <a-select size="small" v-model:value="item.event" style="width: 100%">
              <a-select-option key="change" value="change">Change</a-select-option>
              <a-select-option key="blur" value="blur">Blur</a-select-option>
            </a-select>
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label tr">表达式</div>
          <div class="form-item-content">
            <a-input size="small" v-model:value="item.expression" />
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label tr">目标</div>
          <div class="form-item-content">
            <a-input size="small" v-model:value="item.field" placeholder="目标字段" />
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label tr">执行</div>
          <div class="form-item-content">
            <a-select size="small" v-model:value="item.execute" style="width: 100%">
              <a-select-option key="visible" value="visible">显示</a-select-option>
              <a-select-option key="setValue" value="setValue">设置值</a-select-option>
              <a-select-option key="setOptions" value="setOptions">设置选项</a-select-option>
              <a-select-option key="setAttr" value="setAttr">设置属性</a-select-option>
            </a-select>
          </div>
        </div>
        <template v-if="item.execute === 'setValue'">
          <div class="form-item">
            <div class="form-item-label tr">固定值</div>
            <div class="form-item-content">
              <a-input size="small" v-model:value="item.value" />
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label tr">数据源</div>
            <div class="form-item-content">
              <a-input
                size="small"
                v-model:value="item.dataSourceValue"
                placeholder="数据值路径，如：root.a[0].b"
              />
            </div>
          </div>
        </template>
        <template v-else-if="item.execute === 'setOptions'">
          <div class="form-item" style="grid-column: span 2">
            <div class="form-item-label tr">数据源</div>
            <div class="form-item-content">
              <a-input
                size="small"
                v-model:value="item.dataSourceOptions"
                placeholder="数据选项路径，如：root.a[0].b"
              />
            </div>
          </div>
          <div class="form-item" style="grid-column: span 2">
            <div class="form-item-label tr">静态选项</div>
            <div class="form-item-content">
              <EditTable
                v-bind="staticOptionsTableOption"
                :data="item.staticOptionsTableData"
                @add-row="onStaticOptionsTableAddRow(item)"
                @delete-row="onStaticOptionsTableDeleteRow($event, item)"
                :not-data-hidden-table="true"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div>
      <a-button @click="onAddEvent">+ 添加事件</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {ref} from 'vue';
  import { createRandKey } from '../../utils/helper'
  import { EventItem } from './interface'
  import EditTable from '../../components/EditTable/EditTable.vue'
  import { cloneDeep } from 'lodash-es'

  import {Select,SelectOption,Button,Input} from 'ant-design-vue';

  const ASelect = Select;
  const AButton = Button;
  const AInput = Input;
  const ASelectOption = SelectOption

  const eventList = ref<EventItem[]>([])

  const staticOptionsTableOption = {
    isAdd: true,
    notDataHiddenTable: true,
    columns: [
      {
        title: '名称',
        dataIndex: 'label',
        itemRender: {
          name: 'input',
        },
      },
      {
        title: '值',
        dataIndex: 'value',
        itemRender: {
          name: 'input',
        },
      },
      {
        title: '操作',
        dataIndex: 'id',
        itemRender: {
          name: 'delete-button',
        },
      },
    ],
  }

  function onAddEvent() {
    eventList.value.push({
      id: createRandKey(),
      event: 'change',
      expression: '',
      field: '',
      execute: 'visible',
      value: '',
      dataSourceValue: '',
      dataSourceOptions: '',
      staticOptionsTableData: [],
    })
  }

  function onStaticOptionsTableAddRow(item:any) {
    item.staticOptionsTableData.push({
      id: `-${createRandKey()}`,
    })
  }
  function onStaticOptionsTableDeleteRow(row:any, item:any) {
    item.staticOptionsTableData = item.staticOptionsTableData.filter((p) => p.id != row.id)
  }

  function setData(values:EventItem[]) {
    eventList.value = cloneDeep(values)
  }

  function getData() {
    return cloneDeep(eventList.value)
  }

  defineExpose({
    getData,
    setData,
  })
</script>

<style lang="css" scoped>
  .form-item {
    margin-bottom: 5px;
  }
  .event-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    background: #fafafa;
    padding: 10px;
    margin-bottom: 10px;
  }
  .form-item-label {
    width: 70px;
    line-height: 22px;
  }
</style>
