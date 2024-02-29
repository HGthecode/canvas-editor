import { ObjectType } from '../../interface/Common'
import { FormProps } from '../DataForm/interface'
import { EditTableProps } from '../EditTable/types'

export interface FormModalProps {
  title: string
  width: number
  form: FormProps
  table?: EditTableProps
  onSubmit?: (values: ObjectType<any>) => void
  onCancel?: () => void
}

export interface FormModalData {
  form?: ObjectType<any>
  table?: ObjectType<any>[]
}
