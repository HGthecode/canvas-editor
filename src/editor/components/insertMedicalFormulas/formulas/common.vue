<template>
  <div class="common-formulas">
    <div class="formulas-form">
      <div class="input-item border-right border-bottom">
        <div class="form-item">
          <div class="form-item-label">A值</div>
          <div class="form-item-content">
            <a-input v-model:value="state.value1" @change="onChange" />
          </div>
        </div>
      </div>
      <div class="input-item border-bottom">
        <div class="form-item">
          <div class="form-item-label">B值</div>
          <div class="form-item-content">
            <a-input v-model:value="state.value2" @change="onChange" />
          </div>
        </div>
      </div>
      <div class="input-item border-right">
        <div class="form-item">
          <div class="form-item-label">C值</div>
          <div class="form-item-content">
            <a-input v-model:value="state.value3" @change="onChange" />
          </div>
        </div>
      </div>
      <div class="input-item">
        <div class="form-item">
          <div class="form-item-label">D值</div>
          <div class="form-item-content">
            <a-input v-model:value="state.value4" @change="onChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {reactive} from 'vue';
  import { SVG, Svg } from '@svgdotjs/svg.js'
  import { message } from 'ant-design-vue'
  import {Input} from 'ant-design-vue';
  const AInput =Input

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
  let lineWidth = 50

  const onChange = () => {
    canvas.clear()

    // 计算宽度

    const valueLengths = [
      state.value1.length,
      state.value2.length,
      state.value3.length,
      state.value4.length,
    ]
    const sortLengths = valueLengths.sort()
    lineWidth = sortLengths[sortLengths.length - 1] * 16 + 40

    canvas.size(`${lineWidth}px`, `60px`)
    const line = canvas.line(0, 30, lineWidth, 30).stroke({ color: 'black', width: 1 })
    // 计算竖线的起点和终点位置
    const x = (line.attr('x1') + line.attr('x2')) / 2 // 横线的中点 x 坐标
    const y1 = line.attr('y1') - 20 // 横线的起点 y 坐标
    const y2 = y1 + 40 // 竖线的终点 y 坐标

    // 绘制竖线
    canvas.line(x, y1, x, y2).stroke({ color: 'black', width: 1 })

    const cellWidth = lineWidth / 2
    // 绘制数字
    const number1 = canvas.text(state.value1).font({ size: 16 })
    const valueWidth = number1.bbox().width
    const value1X = (cellWidth - valueWidth) / 2
    number1.move(value1X, 10)

    const number2 = canvas.text(state.value2).font({ size: 16 })
    const valueWidth2 = number2.bbox().width
    const valueX2 = cellWidth + (cellWidth - valueWidth2) / 2
    number2.move(valueX2, 10)

    const number3 = canvas.text(state.value3).font({ size: 16 })
    const valueWidth3 = number3.bbox().width
    const valueX3 = (cellWidth - valueWidth3) / 2
    number3.move(valueX3, 30)

    const number4 = canvas.text(state.value4).font({ size: 16 })
    const valueWidth4 = number4.bbox().width
    const valueX4 = cellWidth + (cellWidth - valueWidth4) / 2
    number4.move(valueX4, 30)
  }

  const getData = () => {
    if (!state.value1 && !state.value2 && !state.value3 && !state.value4) {
      message.error('请输入参数')
      return
    }
    const svgString = canvas.svg()
    // console.log(svgString, lineWidth)

    const base64 = btoa(svgString)
    // state.image = 'data:image/svg+xml;base64,' + base64
    return {
      base64,
      formData: {
        value1: state.value1,
        value2: state.value2,
        value3: state.value3,
        value4: state.value4,
      },
      size: {
        width: lineWidth,
        height: 60,
      },
    }
  }

  const setData = (data:any) => {
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
  .formulas-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }
  .formulas-form .input-item {
    padding: 10px;
  }
  .border-top {
    border-top: 2px solid #000;
  }
  .border-right {
    border-right: 2px solid #000;
  }
  .border-bottom {
    border-bottom: 2px solid #000;
  }
  .border-left {
    border-left: 2px solid #000;
  }
</style>
