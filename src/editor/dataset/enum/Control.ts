export enum ControlType {
  TEXT = 'text',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  DATE = 'date',
  RADIO = 'radio',
}

export enum ControlComponent {
  PREFIX = 'prefix',
  POSTFIX = 'postfix',
  PLACEHOLDER = 'placeholder',
  VALUE = 'value',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  LABEL = 'label',
  UNIT = 'unit',
  DATE = 'date',
  EXTRA = 'extra' //额外占位元素
}

// 控件内容缩进方式
export enum ControlIndentation {
  ROW_START = 'rowStart', // 从行起始位置缩进
  VALUE_START = 'valueStart', // 从值起始位置缩进
}
