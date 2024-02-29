// import { ObjectType } from '/#/index'

interface ObjectType<T=any> {
  [key:string]:T
}

export interface ColumnItem {
  title?: string
  dataIndex: string
  width?: number | string
  itemRender?: ItemRender
  align?: 'left' | 'center' | 'right'
}

interface ItemRender {
  name:
    | 'input'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'delete-button'
    | 'check-status'
    | 'auto'
    | 'auto-complete'
  props?: ObjectType<any>
  on?: ItemNo
}

export interface EditTableProps {
  columns: ColumnItem[]
  data?: any
  isAdd?: boolean
  scroll?: ObjectType<string>
  notDataHiddenTable?: boolean
}

interface ItemNo {
  change?: (v: any) => void
}
