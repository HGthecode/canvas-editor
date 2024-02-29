<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="800"
      :maskClosable="false"
      title="插入LaTeX公式"
      destroyOnClose
      @cancel="onModalCancel"
      @ok="onModalSubmit"
    >
      <a-row :gutter="16">
        <a-col :span="16">
          <div class="latex-text mb-sm">
            <div class="title">编辑公式</div>
            <a-textarea :rows="8" v-model:value="state.latexText" @change="onTextChange" />
          </div>
          <div class="latex-view">
            <img v-if="state.currentSvg" :src="state.currentSvg" alt="Latex公式预览" />
            <span v-else class="text">Latex公式预览</span>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="title">常用符号</div>
          <div class="latex-select">
            <div class="latex-list">
              <span
                v-for="(item, cindex) in latexList"
                :key="cindex"
                class="latex-item"
                @click="onClick(item)"
              >
                <img :src="convertLaTextToSVG(item)" />
              </span>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { reactive,onMounted,PropType } from 'vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import { ElementType } from '../../'
  import { LaTexUtils } from '../../core/draw/particle/latex/utils/LaTexUtils'
  import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
  import {ConfigProvider,Modal,Textarea,message,Row,Col} from 'ant-design-vue';
  const AConfigProvider =ConfigProvider
  const AModal = Modal
  const ATextarea = Textarea
  const ARow = Row
  const ACol = Col


  // import { FormControlModalProps } from './interface'

  //  withDefaults(defineProps<FormControlModalProps>(), {})
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

  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
    currentSvg: string
    latexText: string
  }>({
    visible: false,
    currentSvg: '',
    latexText: '',
  })

  const latexList = [
    `\\times`,
    '\\div',
    '\\pm',
    '\\mp',
    '\\cdot',
    '\\star',
    '\\neq ',
    '\\leq',
    '\\geq',
    '\\sim',
    '\\equiv',
    '\\propto',
    '\\hat{a}',
    '\\breve{a}',
    '\\acute{a}',
    '\\grave{a}',
    '\\tilde{a}',
    '\\bar{a}',
    '\\vec{a}',
    '\\sum',
    '\\sqrt{ab}',
    '\\sqrt[n]{ab}',
    '\\log',
    '\\ln',
    '\\exp',
    '\\mod',
    '\\lim',
    '\\sin',
    '\\cos',
    '\\tan',
    '\\csc',
    '\\sec',
    '\\cot',
    '\\sinh',
    '\\cosh',
    '\\tanh',
    '\\csch',
    '\\sech',
    '\\coth',
    '\\rm',
    '\\it',
    '\\bf',
    '\\sf',
    '\\tt',
    // '\\gg',
    // '\\in',
    // '\\subset',
    // '\\subseteq',
    // '\\prec',
    // '\\preceq',
    // '\\simeq',
    // '\\asymp',
    // '\\doteq',
    // '\\succ',
    // '\\succ',
    // '\\succeq',
    // '\\sqsubseteq',
    // '\\sqsupseteq',
    // '\\ni',
    // '\\models',
  ]

  function onClick(item:string) {
    let value = `${item} `
    if (state.latexText) {
      value = ` ${item} `
    }
    state.latexText = state.latexText + value
    onTextChange({
      target: {
        value: state.latexText,
      },
    })
  }

  function convertLaTextToSVG(laTex: string): string {
    const { svg } = new LaTexUtils(laTex).svg({
      SCALE_X: 10,
      SCALE_Y: 10,
      MARGIN_X: 0,
      MARGIN_Y: 0,
    })
    return svg
  }

  function onTextChange(e:any) {
    const { value } = e.target
    if (value) {
      const svg = convertLaTextToSVG(value)
      state.currentSvg = svg
    }
  }

  function onModalSubmit() {
    if (!state.latexText) {
      message.error('请输入公式')
      return
    }
    props.command.insertElementList([
      {
        type: ElementType.LATEX,
        value: state.latexText,
      },
    ])
    onModalCancel()
  }

  function onModalCancel() {
    state.visible = false
  }
</script>

<style lang="css" scoped>
  .latex-view {
    border: 1px solid #ddd;
    border-radius: 5px;
    min-height: 120px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .latex-view .text {
    color: #999;
    line-height: 100px;
  }
  .latex-view  img {
    max-width: 100%;
  }
  .latex-select {
    height: 400px;
    overflow-y: auto;
    
  }
  .latex-select .latex-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: auto;
  }
  .latex-select .latex-list  span {
    margin: 5px 3px;
    text-align: center;
    border-radius: 3px;
    height: 45px;
    line-height: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .latex-select .latex-list  span:hover {
      background: #ddd;
  }
  .title {
    color: #999;
  }
</style>
