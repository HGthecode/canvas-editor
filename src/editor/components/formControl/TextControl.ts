import { FormInputType } from '../../components/DataForm/interface'
import { FormControlHooksResult } from './interface'
import { ElementType, ControlType } from '../../index'

export default function useTextControl(): FormControlHooksResult {
  const baseFormItems = [
    {
      title: '最小宽度',
      field: 'minWidth',
      type: FormInputType.NUMBER,
    },
    {
      title: '文字颜色',
      field: 'textColor',
      type: FormInputType.COLOR,
    },
    // {
    //   title: '单位文本',
    //   field: 'suffix',
    //   type: FormInputType.INPUT,
    // },
    // {
    //   title: '加密显示',
    //   field: 'encryption',
    //   type: FormInputType.NUMBER,
    // },
    // {
    //   title: '校验规则',
    //   field: 'rule',
    //   type: FormInputType.NUMBER,
    // },
  ]

  const onSubmit = (e:any) => {
    return new Promise((resolve) => {
      const { values, context,command } = e
      console.log(context.hoverElement)
      
      if (context && context.hoverElement) {
        //编辑时移除元素
        command.removeControl()
      }
      command.insertElementList([
        {
          type: ElementType.CONTROL,
          value: '',
          control: {
            type: ControlType.TEXT,
            extension: {
              ...values,
            },
            minWidth: values.minWidth ?? null,
            value: values.default
              ? [
                  {
                    value: values.default,
                  },
                ]
              : null,
            placeholder: values.placeholder ?? '',
          },
        },
      ])
      resolve('success')
    })
  }
  return {
    baseFormItems,
    onSubmit,
  }
}
