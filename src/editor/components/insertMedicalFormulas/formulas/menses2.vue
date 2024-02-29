<template>
  <div class="formulas-wraper">
    <a-row>
      <a-col :span="12" />
      <a-col :span="12">
        <div class="input-item">
          <div class="form-item-label">经期（天）</div>
          <div class="form-item-content">
            <a-input v-model:value="state.value1" @change="onChange" />
          </div>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12">
        <div class="input-item">
          <div class="form-item-label">初潮年龄（岁）</div>
          <div class="form-item-content">
            <a-input v-model:value="state.value2" @change="onChange" />
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="line-h"></div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12" />
      <a-col :span="12">
        <div class="input-item">
          <div class="form-item-label">周期（天）</div>
          <div class="form-item-content">
            <a-input v-model:value="state.value3" @change="onChange" />
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
  import {reactive} from 'vue';
  import { SVG, Svg } from '@svgdotjs/svg.js'
  import { message } from 'ant-design-vue'
  import {Input,Row,Col} from 'ant-design-vue';
  const AInput =Input
  const ARow = Row
  const ACol = Col


  const state = reactive<{
    value1: string
    value2: string
    value3: string
    value4: string
  }>({
    value1: '',
    value2: '',
    value3: '',
    value4: '',

  })
  let canvas: Svg = SVG().addTo('#formulasView').size('100%', '100%')
  let canvasWidth = 60
  let canvasHeight = 42

  const onChange = () => {
    canvas.clear()

    const valueLengths = [state.value1.length, state.value2.length, state.value3.length]
    const sortLengths = valueLengths.sort()
    canvasWidth = sortLengths[sortLengths.length - 1] * 14 * 2 + 5
    const cellWidth = canvasWidth / 2

    canvas.size(`${canvasWidth}px`, `${canvasHeight}px`)
    canvas.line(cellWidth + 8, 14, cellWidth, 32).stroke({ color: 'black', width: 1 })
    canvas.line(cellWidth + 10, 22, canvasWidth, 22).stroke({ color: 'black', width: 1 })

    // 绘制数字
    const number1 = canvas.text(state.value1).font({ size: 16 })
    const valueWidth = number1.bbox().width
    const value1X = cellWidth + (cellWidth - valueWidth) / 2 + 5
    number1.move(value1X, 0)

    const number2 = canvas.text(state.value2).font({ size: 16 })
    const valueWidth2 = number2.bbox().width
    const valueX2 = cellWidth - valueWidth2
    number2.move(valueX2, 12)

    const number3 = canvas.text(state.value3).font({ size: 16 })
    const valueWidth3 = number3.bbox().width
    const valueX3 = cellWidth + (cellWidth - valueWidth3) / 2 + 5
    number3.move(valueX3, 20)
  }

  const getData = () => {
    if (!state.value1 && !state.value2 && !state.value3 && !state.value4) {
      message.error('请输入参数')
      return
    }
    const svgString = canvas.svg()
    const base64 = btoa(svgString)
    return {
      base64,
      formData: {
        value1: state.value1,
        value2: state.value2,
        value3: state.value3,
        value4: state.value4,
      },
      size: {
        width: canvasWidth,
        height: canvasHeight,
      },
    }
  }

  const setData = (data) => {
    state.value1 = data.value1
    state.value2 = data.value2
    state.value3 = data.value3
    state.value4 = data.value4
    onChange()
  }
  defineExpose({
    getData,
    setData,
  })
</script>
<style lang="css" scoped>
  .line-h {
    position: relative;
    height: 32px;
    margin-top: 22px;
  }
  .line-h::after {
    content: '';
    width: calc(100% - 20px);
    height: 2px;
    background: #000;
    position: absolute;
    top: 14px;
    left: 20px;
    z-index: 1;
  }
  .line-h::before {
    content: '';
    width: 20px;
    height: 2px;
    background: #000;
    transform: rotate(-65deg);
    position: absolute;
    top: 14px;
    left: 0;
    z-index: 1;
  }
</style>
