<template>
  <div class="">
    <a-radio-group v-model:value="state.type" style="width: 100%">
      <div class="rule-item">
        <a-radio value="null">不验证格式</a-radio>
      </div>
      <div class="rule-item">
        <a-radio value="text">文本格式校验</a-radio>
        <div class="rule-content flex">
          <div class="form-item flex-item">
            <div class="form-item-label">最小长度</div>
            <div class="form-item-content">
              <a-input :disabled="state.type !== 'text'" v-model:value="state.textRule.minLength" />
            </div>
          </div>
          <div class="form-item flex-item">
            <div class="form-item-label">最大长度</div>
            <div class="form-item-content">
              <a-input :disabled="state.type !== 'text'" v-model:value="state.textRule.maxLength" />
            </div>
          </div>
        </div>
      </div>
      <div class="rule-item">
        <a-radio value="number">数值格式校验</a-radio>
        <div class="rule-content flex">
          <div class="form-item flex-item">
            <div class="form-item-label">最小值</div>
            <div class="form-item-content">
              <a-input :disabled="state.type !== 'number'" v-model:value="state.numberRule.min" />
            </div>
          </div>
          <div class="form-item flex-item">
            <div class="form-item-label">最大值</div>
            <div class="form-item-content">
              <a-input :disabled="state.type !== 'number'" v-model:value="state.numberRule.max" />
            </div>
          </div>
          <div class="form-item flex-item">
            <div class="form-item-label">最大小数位</div>
            <div class="form-item-content">
              <a-input
                :disabled="state.type !== 'number'"
                v-model:value="state.numberRule.decimal"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="rule-item">
        <a-radio value="date">日期格式校验</a-radio>
        <div class="rule-content flex">
          <div class="form-item flex-item">
            <div class="form-item-label">不得早于</div>
            <div class="form-item-content">
              <a-date-picker :disabled="state.type !== 'date'" v-model:value="state.dateRule.min" />
            </div>
          </div>
          <div class="form-item flex-item">
            <div class="form-item-label">不得晚于</div>
            <div class="form-item-content">
              <a-date-picker :disabled="state.type !== 'date'" v-model:value="state.dateRule.max" />
            </div>
          </div>
        </div>
      </div>
      <div class="rule-item">
        <a-radio value="reg">正则表达式校验</a-radio>
        <div class="rule-content">
          <div class="rule-content flex">
            <div class="form-item flex-item">
              <div class="form-item-label">正则表达式</div>
              <div class="form-item-content">
                <a-input
                  v-model:value="state.regRule.regex"
                  :disabled="state.type !== 'reg'"
                  placeholder="请输入正则表达式"
                />
              </div>
            </div>
            <div class="form-item flex-item">
              <div class="form-item-label">错误提示</div>
              <div class="form-item-content">
                <a-input :disabled="state.type !== 'reg'" v-model:value="state.regRule.errorText" />
              </div>
            </div>
          </div>

          <!-- <a-input
            v-model:value="state.regRule.regex"
            :disabled="state.type !== 'reg'"
            placeholder="请输入正则表达式"
          />
          <div class="form-item flex-item">
            <div class="form-item-label">错误提示</div>
            <div class="form-item-content">
              <a-input :disabled="state.type !== 'reg'" v-model:value="state.regRule.errorText" />
            </div>
          </div> -->
        </div>
      </div>
    </a-radio-group>
  </div>
</template>
<script setup lang="ts">
import {reactive,ref} from 'vue';
  import dayjs, { Dayjs } from 'dayjs'
  import { cloneDeep } from 'lodash-es'
import { ObjectType } from '../../interface/Common';
import {RadioGroup,Radio,Input,DatePicker} from 'ant-design-vue';

const ARadioGroup = RadioGroup;
const ARadio = Radio;
const AInput = Input;
const ADatePicker = DatePicker;

  interface TextRule {
    minLength: number
    maxLength: number
  }
  interface NumberRule {
    min: number
    max: number
    decimal: number
  }
  interface DateRule {
    min: string | Dayjs
    max: string | Dayjs
  }

  interface RegRule {
    regex: string
    errorText: string
  }

  type RuleType = 'text' | 'number' | 'date' | 'reg' | undefined

  interface StateType {
    type: RuleType
    textRule: TextRule
    numberRule: NumberRule
    dateRule: DateRule
    regRule: RegRule
  }

  const state = ref<StateType>({
    type: undefined,
    textRule: {
      minLength: 0,
      maxLength: 0,
    },
    numberRule: {
      min: 0,
      max: 0,
      decimal: 0,
    },
    dateRule: {
      min: '',
      max: '',
    },
    regRule: {
      regex: '',
      errorText: '',
    },
  })

  // const state = reactive<{
  //   type: RuleType
  //   textRule: TextRule
  //   numberRule: NumberRule
  //   dateRule: DateRule
  //   regRule: RegRule
  // }>({
  //   type: undefined,
  //   textRule: {
  //     minLength: 0,
  //     maxLength: 0,
  //   },
  //   numberRule: {
  //     min: 0,
  //     max: 0,
  //     decimal: 0,
  //   },
  //   dateRule: {
  //     min: '',
  //     max: '',
  //   },
  //   regRule: {
  //     regex: '',
  //     errorText: '',
  //   },
  // })

  function getData() {
    const data = cloneDeep({
      ...state.value,
    })
    if (data.dateRule && data.dateRule.min) {
      data.dateRule.min = dayjs(data.dateRule.min).format('YYYY-MM-DD')
    }
    if (data.dateRule && data.dateRule.max) {
      data.dateRule.max = dayjs(data.dateRule.max).format('YYYY-MM-DD')
    }

    return data
  }
  function setData(values:ObjectType<any>) {
    const stateKeys = Object.keys(state.value)
    const currentState:any = state.value
    for (const key in values) {
      const value = values[key]
      if (key === 'dateRule') {
        if (value.min) {
          currentState[key].min = dayjs(value.min)
        }
        if (value.max) {
          currentState[key].max = dayjs(value.max)
        }
        // state[key] = value
        console.log(value)
      } else if (stateKeys.includes(key)) {
        currentState[key] = value
      }
    }
    state.value=currentState
  }
  defineExpose({
    getData,
    setData,
  })
</script>

<style lang="css" scoped>
  .rule-item {
    margin-bottom: 10px;
  }
  .form-item-label {
    width: 94px;
    text-align: right;
  }
</style>
