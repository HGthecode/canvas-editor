<template>
  <a-modal
    v-model:open="state.visible"
    :width="width"
    :bodyStyle="{ padding: '0 10px 10px' }"
    :maskClosable="false"
    :title="title"
    destroyOnClose
    @cancel="onCancel"
    @ok="onFormSubmit"
  >
    <DataForm ref="formRef" v-bind="form" />
    <EditTable
      v-if="table && table.columns"
      v-bind="table"
      :data="state.tableData"
      @addRow="onTableAddRow"
    />
  </a-modal>
</template>

<script setup lang="ts">
  import { PropType,ref,reactive,onMounted } from 'vue'
  import DataForm from '../DataForm'
  import { FormProps } from '../DataForm/interface'
  import EditTable from '../EditTable'
  import { EditTableProps } from '../EditTable/types'
  import { ObjectType } from '../../interface/Common'
  import {Modal} from 'ant-design-vue';
  const AModal = Modal;

  const formRef = ref()

  const props = defineProps({
    title: {
      type: String as PropType<string>,
      default: '表单窗口',
    },
    width: {
      type: Number as PropType<number>,
      default: 600,
    },
    form: {
      type: Object as PropType<FormProps>,
      default: () => {
        return {}
      },
    },
    table: {
      type: Object as PropType<EditTableProps>,
      default: () => {
        return {}
      },
    },
    onSubmit: {
      type: Function,
      default: () => {
        return {}
      },
    },
    onCancel: {
      type: Function,
      default: () => {
        return
      },
    },
  })

  const state = reactive<{
    visible: boolean
    tableData: ObjectType<any>[]
  }>({
    visible: false,
    tableData: [],
  })

  if (props.table && props.table.data) {
    state.tableData = props.table.data
  }

  onMounted(() => {
    state.visible = true
  })

  const onCancel = () => {
    props.onCancel && props.onCancel()
    state.visible = false
  }

  async function onFormSubmit() {
    const formData = await formRef.value.onSubmit()
    props.onSubmit &&
      props.onSubmit({
        form: formData,
        table: state.tableData,
      })
    state.visible = false
    // console.log(formData, state.tableData)
  }

  const onTableAddRow = () => {
    state.tableData.push({})
  }

  //   const onSubmit = () => {
  //     const formData = await formRef.value.onSubmit()
  //     props.onSubmit && props.onSubmit()
  //     state.visible = false
  //   }
</script>

<style lang="css" scoped></style>
