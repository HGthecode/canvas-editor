import FormModal from '../FormModal'
import { FormInputType } from '../DataForm/interface'
import {ElementType} from '../../index'
// import { FormControlModalProps } from '../../components/formControl/interface'
import {InsertLinkModalProps} from './interface'

export default (props:InsertLinkModalProps)=>{
    FormModal({
        title: '超链接',
        width: 500,
        form: {
          colspan: 1,
          items: [
            {
              title: '文本',
              field: 'name',
              type: FormInputType.INPUT,
              props: {
                placeholder: '请输入文本',
              },
              rules: [{ required: true, message: '请输入文本', trigger: 'change' }],
            },
            {
              title: '链接',
              field: 'url',
              type: FormInputType.INPUT,
              props: {
                placeholder: '请输入超链接URL',
              },
              rules: [{ required: true, message: '请输入超链接', trigger: 'change' }],
            },
          ],
        },
        onSubmit: (values) => {
          props.command?.hyperlink({
            type: ElementType.HYPERLINK,
            value: '',
            url: values.form.url,
            valueList: values.form.name.split('').map((n:string) => ({
              value: n,
              size: 16,
            })),
          })
        },
      })

}