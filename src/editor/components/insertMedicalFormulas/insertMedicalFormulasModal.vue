<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="860"
      :maskClosable="false"
      title="插入医学公式"
      destroyOnClose
      @cancel="onModalCancel"
      @ok="onModalSubmit"
    >
      <a-row :gutter="16">
        <a-col :span="16">
          <div class="formulas-text mb-sm">
            <div class="title">编辑公式</div>
            <div class="formulas-editor">
              <component ref="formulasComponentRef" :is="currentFormulasComponent" />
              <!-- <div v-else class="tip">请选择公式</div> -->
            </div>
          </div>
          <div class="title">公式预览</div>
          <div class="formulas-view">
            <!-- <img v-if="state.currentSvg" :src="state.currentSvg" alt="Latex公式预览" /> -->
            <div id="formulasView"></div>
            <!-- <span v-else class="text">公式预览</span> -->
          </div>
        </a-col>
        <a-col :span="8">
          <div class="title">常用公式</div>
          <div class="formulas-select">
            <div class="formulas-list">
              <div
                v-for="(item, cindex) in formulasList"
                :key="cindex"
                class="formulas-item"
                @click="onClick(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { ref,reactive, onMounted,computed,PropType } from 'vue'
  import { message } from 'ant-design-vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import { ElementType } from '../../index'
  import {  FormItemType } from '../../components/DataForm/interface'
  import CommonFormulas from './formulas/common.vue'
  import Menses1Formulas from './formulas/menses1.vue'
  import Menses2Formulas from './formulas/menses2.vue'
  import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
  import {ConfigProvider,Modal,Row,Col} from 'ant-design-vue';
  const AConfigProvider =ConfigProvider
  const AModal = Modal
  const ARow = Row
  const ACol = Col

 const props = defineProps({
    context: {
      type: Object as PropType<IContextMenuContext>,
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
    command:{
      type:Object,
      default:()=>{}
    }
  })

  const formulasComponentRef = ref()

  const state = reactive<{
    visible: boolean
    currentSvg: string
    latexText: string
    formItems: FormItemType[]
    currentFormulasCode: string
  }>({
    visible: false,
    currentSvg: '',
    latexText: '',
    formItems: [],
    currentFormulasCode: '',
  })

  const currentFormulasComponent = computed(() => {
    if (state.currentFormulasCode === 'common') {
      return CommonFormulas
    } else if (state.currentFormulasCode === 'menses1') {
      return Menses1Formulas
    } else if (state.currentFormulasCode === 'menses2') {
      return Menses2Formulas
    }
  })

  const formulasList = [
    {
      code: 'common',
      name: '通用公式',
      image: '',
    },
    {
      code: 'menses1',
      name: '月经史公式1',
      image: '',
    },
    {
      code: 'menses2',
      name: '月经史公式2',
      image: '',
    },
  ]

  onMounted(() => {
    state.visible = true
    if (props.context && props.context.startElement) {
      // 编辑属性时，赋值表单
      const extension = props.context.startElement?.extension
      if (extension && extension.options) {
        setTimeout(() => {
          state.currentFormulasCode = extension.options.code
          setTimeout(() => {
            formulasComponentRef.value.setData(extension.options)
          }, 300)
        }, 200)
      }
    }
  })

  function onClick(item:any) {
    document.getElementById('formulasView')!.innerHTML = ''
    state.currentFormulasCode = item.code
  }

  function onModalSubmit() {
    const { base64, formData, size } = formulasComponentRef.value.getData()
    if (!base64) {
      message.error('请输入参数')
      return
    }
    console.log(size)

    const svgElement = 'data:image/svg+xml;base64,' + base64
    if (props.context && props.context.startElement) {
      //编辑时
      props.command.replaceImageElement(svgElement, {
        value: '',
        width: size.width,
        height: size.height,
        extension: {
          type: 'medicalFormulas',
          options: {
            ...formData,
            code: state.currentFormulasCode,
          },
        },
      })
    } else {
      props.command.insertElementList([
        {
          type: ElementType.IMAGE,
          value: svgElement,
          width: size.width,
          height: size.height,
          extension: {
            type: 'medicalFormulas',
            options: {
              ...formData,
              code: state.currentFormulasCode,
            },
          },
        },
      ])
    }
    onModalCancel()
  }

  function onModalCancel() {
    state.visible = false
  }
</script>

<style lang="css" scoped>
  .formulas-view {
    border: 1px solid #ddd;
    border-radius: 5px;
    min-height: 220px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
  }
  .formulas-view .text {
    color: #999;
    line-height: 100px;
  }
  .formulas-view  img {
    max-width: 100%;
  }
  .formulas-select {
    height: 400px;
    overflow-y: auto;
  }
  .formulas-select .formulas-list .formulas-item {
    margin: 5px 3px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 3px;
    height: 45px;
    line-height: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
   
  }
  .formulas-select .formulas-list .formulas-item:hover {
    background: #ddd;
  }
  .title {
    color: #999;
  }
  .formulas-editor {
    border: 1px solid #ddd;
    border-radius: 5px;
    min-height: 220px;
    padding: 10px;
    
  }
  .formulas-editor .tip {
      color: #999;
      line-height: 100px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }
</style>
