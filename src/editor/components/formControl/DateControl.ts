import { FormInputType } from '../../components/DataForm/interface'
import { FormControlHooksResult } from './interface'
import { ElementType, ControlType } from '../../index'

export default function useDateControl(): FormControlHooksResult {
  const baseFormItems = [
    {
      title: '格式化',
      field: 'format',
      type: FormInputType.AUTOCOMPLETE,
      props: {
        options: [
          { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
          { label: 'YYYY-MM-DD HH:mm', value: 'YYYY-MM-DD HH:mm' },
          { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
          { label: 'HH:mm', value: 'HH:mm' },
          { label: 'HH:mm:ss', value: 'HH:mm:ss' },
          { label: 'YYYY年MM月DD日', value: 'YYYY年MM月DD日' },
          { label: 'YYYY年MM月DD日 HH时mm分', value: 'YYYY年MM月DD日 HH时mm分' },
          { label: 'YYYY年MM月DD日 HH时mm分ss秒', value: 'YYYY年MM月DD日 HH时mm分ss秒' },
          { label: 'HH时mm分', value: 'HH时mm分' },
          { label: 'HH时mm分ss秒', value: 'HH时mm分ss秒' },
        ],
      },
    },
  ]

  const onSubmit = (e:any) => {
    return new Promise((resolve) => {
      const { values, context,command } = e
      
      if (context) {
        //编辑时移除元素
       command.removeControl()
      }
      command.insertElementList([
        {
          type: ElementType.CONTROL,
          value: '',
          control: {
            type: ControlType.DATE,
            extension: {
              ...values,
            },
            minWidth: values.minWidth ?? null,
            dateFormat: values.format ?? null,
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
