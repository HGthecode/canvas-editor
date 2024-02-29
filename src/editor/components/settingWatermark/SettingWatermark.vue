<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="450"
      :bodyStyle="{ padding: '0 10px 10px' }"
      :maskClosable="false"
      title="水印设置"
      destroyOnClose
      @ok="onWindowSubmit"
      @cancel="onWindowCancel"
    >
      <data-form ref="formRef" :colspan="1" :items="formItems" :data="state.formData" />
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { ref,onMounted,reactive, PropType } from 'vue'
  import DataForm from '../../components/DataForm'
  import { FormInputType } from '../../components/DataForm/interface'
  import { IWatermark } from '../../'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import {ConfigProvider,Modal} from 'ant-design-vue';
  const AConfigProvider =ConfigProvider
  const AModal = Modal

  const props = defineProps({
    data: {
      type: Object as PropType<IWatermark>,
      default: () => {
        return {}
      },
    },
    command:{
      type:Object,
      default:()=>{}
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

  const formRef = ref()
  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
    formData: any
  }>({
    visible: false,
    formData: {},
  })
  if (props.data) {
    state.formData = props.data
  }

  const formItems = [
    {
      title: '内容',
      field: 'data',
      type: FormInputType.INPUT,
      rules: [{ required: true, message: '请输入内容', trigger: 'blur' }],
    },

    {
      title: '字体大小',
      field: 'size',
      type: FormInputType.NUMBER,
      rules: [{ required: true, message: '请输入字体大小', trigger: 'blur' }],
    },
    {
      title: '字体颜色',
      field: 'color',
      type: FormInputType.COLOR,
      rules: [{ required: true, message: '请选择字体颜色', trigger: 'blur' }],
    },
  ]

  function onWindowCancel() {
    state.visible = false
  }

  async function onWindowSubmit() {
    const formData = await formRef.value.onSubmit()
    props.command.addWatermark({
      data: formData.data,
      color: formData.color,
      size: Number(formData.size),
    })
    onWindowCancel()
  }
</script>

