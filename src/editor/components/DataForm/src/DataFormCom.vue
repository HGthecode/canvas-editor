<template>
  <a-form
    ref="formRef"
    :class="['data-form', props.layout]"
    :style="formStyle"
    :rules="state.formRules"
    :model="state.formData"
  >
    <!-- renderFormItemStyle(item) -->
    <a-form-item
      v-for="item in items"
      :key="item.field"
      :class="['data-form-item', item.class, `colspan_${item.colspan}`, `rowspan_${item.rowspan}`]"
      :name="item.field"
      :colon="item.colon !== false"
    >
      <template #label>
        <div
          v-if="item.title"
          :class="['data-form-item_title', { colon: item.colon !== false }]"
          :style="{ width: `${item.titleWidth}px` }"
          >{{ item.title }}</div
        >
      </template>
      <div :class="['data-form-item-wrapper', item.align]">
        <div class="data-form-item-content">
          <a-select
            v-if="item.type == FormInputType.SELECT"
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onValueChange($event, item)"
            size="small"
          />
          <a-radio-group
            v-else-if="item.type == FormInputType.RADIOGROUP"
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onInputChange($event, item)"
          />
          <a-radio-group
            v-else-if="item.type == FormInputType.BUTTONRADIOGROUP && item.props"
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onInputChange($event, item)"
          >
            <a-radio-button v-for="(option) in item.props.options" :key="option.value" :value="option.value">
              {{option.label}}
            </a-radio-button>
          </a-radio-group>

          <a-input-number
            v-else-if="item.type == FormInputType.NUMBER"
            v-bind="item.props"
            style="width: 100%"
            v-model:value="state.formData[item.field]"
            @change="onValueChange($event, item)"
            size="small"
          />
          <a-checkbox
            v-else-if="item.type == FormInputType.CHECKBOX"
            v-bind="item.props"
            style="width: 100%"
            v-model:checked="state.formData[item.field]"
            @change="onCheckboxValueChange($event, item)"
          />
          <a-switch
            v-else-if="item.type == FormInputType.SWITCH"
            v-bind="item.props"
            v-model:checked="state.formData[item.field]"
            @change="onSwitchValueChange($event, item)"
          />
          <a-date-picker
            v-else-if="item.type == FormInputType.DATE"
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onDateValueChange($event, item)"
            size="small"
          />
          <a-auto-complete
            v-else-if="item.type == FormInputType.AUTOCOMPLETE"
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onValueChange($event, item)"
            size="small"
          />
          <color-picker
            v-else-if="item.type == FormInputType.COLOR"
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onValueChange($event, item)"
          />
          <a-textarea
            v-else-if="item.type == FormInputType.TEXTAREA"
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onInputChange($event, item)"
            size="small"
            class="mb-xs"
          />
          <div v-else-if="item.type == FormInputType.TEXT">
            {{ state.formData[item.field] }}
          </div>
          <div v-else-if="item.type == FormInputType.SLOT">
            <slot :name="item.slot" v-bind="item"></slot>
          </div>
          <a-input
            v-else
            v-bind="item.props"
            v-model:value="state.formData[item.field]"
            @change="onInputChange($event, item)"
            size="small"
          />
        </div>
      </div>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import {ref,computed,reactive,watchEffect,PropType} from 'vue';
  import { FormItemType, FormInputType } from '../interface'
  import { ValidateErrorEntity } from 'ant-design-vue/lib/form/interface'
  import ColorPicker from './ColorPicker.vue'
  import { ObjectType } from '../../../interface/Common'
  import type { Dayjs } from 'dayjs'
  import { Rule } from 'ant-design-vue/lib/form/interface'
  import {Form,FormItem,Select,RadioGroup,Input,InputNumber,Switch,DatePicker,AutoComplete,Textarea,Checkbox,RadioButton} from 'ant-design-vue';

  const AForm = Form;
  const AFormItem = FormItem;
  const ASelect = Select;
  const ARadioGroup = RadioGroup;
  const AInput = Input;
  const AInputNumber = InputNumber;
  const ASwitch = Switch;
  const ADatePicker = DatePicker;
  const AAutoComplete = AutoComplete;
  const ATextarea = Textarea
  const ACheckbox = Checkbox
  const ARadioButton = RadioButton


  const formRef = ref()
  // const props = withDefaults(defineProps<FormProps>(), {
  //   layout: 'grid',
  //   colspan: 1,
  // })

  const props = defineProps({
    layout: {
      type: String,
      default: "grid",
    },
    colspan: {
      type: Number as PropType<number>,
      default: 1,
    },
    items: {
      type: Array as PropType<FormItemType[]>,
      default: () => {
        return []
      },
    },
    data: {
      type: Object as PropType<any>,
      default: () => {
        return {}
      },
    },
    rules: {
      type: Array as PropType<Rule[]>,
      default: () => {
        return []
      },
    },
  })

  const emit = defineEmits<{
    (event: 'change', value: any, item: FormItemType): void
  }>()

  const formStyle = computed(() => {
    if (props.layout === 'grid') {
      let formColnumStyle = ''
      for (let i = 0; i < props.colspan; i++) {
        formColnumStyle += ' 1fr'
      }
      return {
        'grid-template-columns': formColnumStyle,
      }
    }
    return {}
  })

  const state = reactive<{
    formRules: ObjectType<any>
    formData: ObjectType<any>
  }>({
    formRules: {},
    formData: {},
  })

  const handleFormData = (data: ObjectType<any>) => {
    let formData:any = {}
    for (const key in data) {
      formData[key] = data[key]
    }
    state.formData = formData
  }

  watchEffect(() => {
    handleFormData(props.data as ObjectType<any>)
  })

  const onValueChange = (value: any, item: FormItemType) => {
    state.formData[item.field] = value
    item.onChange && item.onChange(value)
    onChange(value, item)
  }
  const onCheckboxValueChange = (e: any, item: FormItemType) => {
    state.formData[item.field] = e.target.checked
    item.onChange && item.onChange(e.target.checked)
    onChange(e.target.checked, item)
  }
  const onSwitchValueChange = (flag: boolean, item: FormItemType) => {
    state.formData[item.field] = flag
    item.onChange && item.onChange(flag)
    onChange(flag, item)
  }
  const onInputChange = (e: any, item: FormItemType) => {
    state.formData[item.field] = e.target.value
    item.onChange && item.onChange(e.target.value)
    onChange(e.target.value, item)
  }
  const onDateValueChange = (e: Dayjs, item: FormItemType) => {
    console.log(e.format('YYYY-MM-DD'), item)

    // state.formData[item.field] = e.target.value
    // item.onChange && item.onChange(e.target.value)
    // onChange(e.target.value, item)
  }
  const onChange = (value: any, item: FormItemType) => {
    emit('change', value, item)
  }

  // const renderFormItemStyle = (item: FormItemType) => {
  //   let styles = item.style ? item.style : {}
  //   if (props.layout === 'grid') {
  //     // grid模式下每个单元格所占格
  //     if (item.colspan) {
  //       // const itemColspan = ''
  //       styles['gridColumn'] = 'span ' + item.colspan
  //     }
  //     if (item.rowspan && item.rowspan > 1) {
  //       styles['gridRow'] = 'span ' + item.rowspan
  //     }
  //   }
  //   return styles
  // }

  function handleFormRules(items: FormItemType[]) {
    const rules: any = {}
    if (items && items.length) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.rules && item.rules.length) {
          rules[item.field] = item.rules
        }
      }
    }
    return rules
  }
  const itemsRules = handleFormRules(props.items)
  state.formRules = { ...props.rules, ...itemsRules }
  const onSubmit = () => {
    return new Promise((resolve, reject) => {
      formRef.value
        .validate()
        .then(() => {
          resolve(state.formData)
        })
        .catch((error: ValidateErrorEntity<any>) => {
          reject(error)
        })
    })
  }
  const getData = () => {
    return state.formData
  }

  defineExpose({
    onSubmit,
    getData,
  })
</script>

<style lang="css" scoped>
  @import './dataForm.css';
</style>
