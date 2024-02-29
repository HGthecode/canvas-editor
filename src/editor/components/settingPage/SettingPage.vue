<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :bodyStyle="{ padding: '0 10px 10px' }"
      :maskClosable="false"
      title="页面设置"
      destroyOnClose
      @ok="onModalSubmit"
      @cancel="onModalCancel"
    >
      <a-divider orientation="left">页边距</a-divider>
      <div>
        <data-form
          ref="paddingFormRef"
          :colspan="2"
          :items="paddingFormItems"
          :data="state.paddingFormData"
        />
      </div>
      <a-divider orientation="left">方向</a-divider>
      <div style="padding-left: 50px">
        <button-picker v-model:value="state.direction" :options="directionOptions" mode="check" />
      </div>
      <a-divider orientation="left">纸张</a-divider>
      <div style="padding-left: 50px">
        <a-select style="width: 200px" v-model:value="state.paperSize">
          <a-select-option v-for="item in paperSizeOptions" :key="item.value">
            {{ item.label }}（{{ item.cm[0] }}*{{ item.cm[1] }}）
          </a-select-option>
        </a-select>
      </div>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import {  reactive,ref,onMounted } from 'vue'
  import DataForm from '../../components/DataForm'
  import { FormInputType } from '../../components/DataForm/interface'
  import ButtonPicker from '../../components/ButtonPicker'
  import { ButtonPickerOptionItem } from '../../components/ButtonPicker/interface'
  import { PaperDirection } from '../../'
  import {  pageSettingMaring, PageSettingSubmitResult } from './interface'
  import { getDpi, toTwoFixed } from '../../utils/helper'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import {ConfigProvider,Modal,Divider,Select,SelectOption} from 'ant-design-vue';
  const AConfigProvider =ConfigProvider
  const AModal = Modal
  const ADivider = Divider
  const ASelect = Select
  const ASelectOption = SelectOption

  const props = defineProps({
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

  const paddingFormRef = ref()
  // const paddingFormData = ref()
  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
    direction: PaperDirection
    paperSize: string
    paddingFormData: pageSettingMaring
  }>({
    visible: false,
    direction: PaperDirection.VERTICAL,
    paperSize: 'A4',
    paddingFormData: {
      left: 100,
      top: 120,
      right: 100,
      bottom: 120,
    },
  })

  const paddingFormItems = [
    {
      title: '上(T)',
      field: 'top',
      type: FormInputType.NUMBER,
    },
    {
      title: '下(B)',
      field: 'bottom',
      type: FormInputType.NUMBER,
    },
    {
      title: '左(L)',
      field: 'left',
      type: FormInputType.NUMBER,
    },
    {
      title: '右(R)',
      field: 'right',
      type: FormInputType.NUMBER,
    },
  ]
  const directionOptions: ButtonPickerOptionItem[] = [
    {
      label: '纵向',
      value: PaperDirection.VERTICAL,
      icon: 'icon-doc-vertical',
    },
    {
      label: '横向',
      value: PaperDirection.HORIZONTAL,
      icon: 'icon-doc-horizontal',
    },
  ]

  const pdi = getDpi()
  const cmToPxRatio = (Number(pdi) / 25.4) * 10 //1厘米的像素数
  const pxToCmRatio = 1 / cmToPxRatio //1像素的厘米数

  const paperSizeOptions = [
    {
      label: 'A4',
      value: 'A4',
      // desc: '794*1123',
      cm: [21, 29.7],
      // px: [794, 1123],
    },
    // {
    //   label: 'A2',
    //   value: 'A2',
    //   desc: '1593*2251',
    //   cm: [21, 29.7],
    //   px: [794, 1123],
    // },
    {
      label: 'A3',
      value: 'A3',
      // desc: '1125*1593',
      cm: [29.1, 42],
      px: [1125, 1593],
    },
    {
      label: 'A5',
      value: 'A5',
      // desc: '565*796',
      cm: [14.8, 21],
      px: [565, 796],
    },
    {
      label: '5号信封',
      value: '5号信封',
      // desc: '412*488',
      cm: [11, 22],
      px: [412, 488],
    },
    {
      label: '6号信封',
      value: '6号信封',
      // desc: '450*866',
      cm: [12, 23],
      px: [450, 866],
    },
    {
      label: '7号信封',
      value: '7号信封',
      // desc: '609*862',
      cm: [16.2, 22.9],
      px: [609, 862],
    },
    {
      label: '9号信封',
      value: '9号信封',
      // desc: '862*1221',
      cm: [22.9, 32.4],
      px: [862, 1221],
    },
    {
      label: '法律用纸',
      value: '法律用纸',
      // desc: '813*1266',
      cm: [21.59, 35.56],
      px: [813, 1266],
    },
    {
      label: '信纸',
      value: '信纸',
      // desc: '813*1054',
      cm: [21.59, 27.94],
      px: [813, 1054],
    },
  ]

  // 根据宽高获取纸张类型及方向
  const getPagerValueByWH = (width:number, height:number) => {
    const find = paperSizeOptions.find((item) => {
      let cmW = 0
      let cmH = 0
      if (item.px && item.px.length === 2) {
        cmW = item.px[0]
        cmH = item.px[1]
      } else {
        cmW = cmToPx(item.cm[0])
        cmH = cmToPx(item.cm[1])
      }
      if (width == cmW && height == cmH) {
        return true
      } else if (width == cmH && height == cmW) {
        return true
      }
      return false
    })
    if (find) {
      return {
        size: find.value,
        // direction,
      }
    }
    return {
      size: '',
      // direction,
    }
  }

  const cmToPx = (cm:number) => {
    const value = Math.ceil(cm * cmToPxRatio)
    return Number(value)
  }
  const pxToCm = (px:number) => {
    const value = toTwoFixed(`${px * pxToCmRatio}`)
    return Number(value)
  }

  const editorValue = props.command.getValue()
  
  if (editorValue && editorValue.width) {
    const [top, right, bottom, left] = editorValue.margins
    const width = editorValue.width
    const height = editorValue.height

    const { size } = getPagerValueByWH(width, height)
    state.paperSize = size
    // state.direction = data.direction
    state.paddingFormData = {
      left: pxToCm(left),
      top: pxToCm(top),
      right: pxToCm(right),
      bottom: pxToCm(bottom),
    }
  }

  const onModalCancel = () => {
    props.onCancel && props.onCancel()
    state.visible = false
  }
  const onModalSubmit = async () => {
    const formData = await paddingFormRef.value.onSubmit()
    const paperSize = paperSizeOptions.find((p) => p.value == state.paperSize)
    let width = 794
    let height = 1123
    if (paperSize && paperSize.px) {
      // const arr = paperSize.desc.split('*')
      width = paperSize.px[0]
      height = paperSize.px[1]
    }
    const json: PageSettingSubmitResult = {
      top: cmToPx(formData.top),
      right: cmToPx(formData.right),
      bottom: cmToPx(formData.bottom),
      left: cmToPx(formData.left),
      direction: state.direction,
      paperSize: formData.paperSize,
      width,
      height,
    }

    props.command.setPaperMargin([
      Number(json.top),
      Number(json.right),
      Number(json.bottom),
      Number(json.left),
    ])
    props.command.paperSize(json.width, json.height)
    props.command.paperDirection(json.direction)

    // props.onSubmit && props.onSubmit(json)
    state.visible = false
  }
</script>

