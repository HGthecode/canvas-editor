import { FormItemType } from '../../components/DataForm/interface'
import { FormControlHooksResult } from './interface'
import { ElementType, ControlType } from '../../index'

export default function useCheckboxControl(): FormControlHooksResult {
  const baseFormItems:FormItemType[] = []

  const onSubmit = (e:any) => {
    return new Promise((resolve) => {
      const { values, context,command } = e
      if (context) {
        //编辑时移除元素
        command.removeControl()
      }
      let valueSets = []
      if (values.dataSource && values.dataSource.optionsPath) {
        const dataSourceInstance = command.getDataSourceInstance()
        const dataSourceOptions = dataSourceInstance?.getValueByKey(values.dataSource.optionsPath)
        console.log(dataSourceOptions)
        if (dataSourceOptions) {
          valueSets = dataSourceOptions
            .filter((p:any) => p.label && p.value)
            .map((p:any) => {
              return {
                code: p.value,
                value: p.label,
              }
            })
        }
      } else if (
        values.dataSource &&
        values.dataSource.staticOptions &&
        values.dataSource.staticOptions.length
      ) {
        valueSets = values.dataSource.staticOptions
          .filter((p:any) => p.label && p.value)
          .map((p:any) => {
            return {
              code: p.value,
              value: p.label,
            }
          })
      }
      command.insertElementList([
        {
          type: ElementType.CONTROL,
          value: '',
          control: {
            type: ControlType.SELECT,
            extension: {
              ...values,
            },
            minWidth: values.minWidth ?? null,
            value: null,
            code: values.default ? values.default : null,
            valueSets: valueSets,
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
