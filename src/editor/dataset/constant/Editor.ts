import {IOptionsItem} from '../../interface/Editor'
import { ListStyle } from '../enum/List'

export const EDITOR_COMPONENT = 'editor-component'
export const EDITOR_PREFIX = 'ce'

export const defaultFontOptions:IOptionsItem[] = [
    { value: 'Microsoft YaHei', name: '微软雅黑' },
    { value: '宋体', name: '宋体' },
    { value: '黑体', name: '黑体' },
    { value: '仿宋', name: '仿宋' },
    { value: '楷体', name: '楷体' },
    { value: '等线', name: '等线' },
    { value: '华文琥珀', name: '华文琥珀' },
    { value: '华文楷体', name: '华文楷体' },
    { value: '华文隶书', name: '华文隶书' },
    { value: '华文新魏', name: '华文新魏' },
    { value: '华文行楷', name: '华文行楷' },
    { value: '华文中宋', name: '华文中宋' },
    { value: '华文彩云', name: '华文彩云' },
    { value: 'Arial', name: 'Arial' },
    { value: 'Segoe UI', name: 'Segoe UI' },
    { value: 'Ink Free', name: 'Ink Free' },
    { value: 'Fantasy', name: 'Fantasy' },
]

export const defaultFontSizeOptions:IOptionsItem[] = [
    { value: 56, name: '初号' },
    { value: 48, name: '小初' },
    { value: 34, name: '一号' },
    { value: 32, name: '小一' },
    { value: 26, name: '二号' },
    { value: 24, name: '小二' },
    { value: 22, name: '三号' },
    { value: 20, name: '小三' },
    { value: 18, name: '四号' },
    { value: 16, name: '小四' },
    { value: 14, name: '五号' },
    { value: 12, name: '小五' },
    { value: 10, name: '六号' },
    { value: 8, name: '小六' },
    { value: 7, name: '七号' },
    { value: 6, name: '八号' },
]

export const defaultRowMarginOptions:IOptionsItem[] = [
    { value: 0.4, name: '1' },
    { value: 0.6, name: '1.25' },
    { value: 0.8, name: '1.5' },
    { value: 1, name: '1.75' },
    { value: 1.25, name: '2' },
    { value: 1.5, name: '2.5' },
    { value: 1.75, name: '3' },
]

export const defaultListStyleOptions:IOptionsItem[] = [
    { value: undefined, name: '取消列表' },
    { value:ListStyle.DECIMAL, name: '有序列表' },
    { value: ListStyle.DISC, name: '实心圆点列表' },
    { value: ListStyle.CIRCLE, name: '空心圆点列表' },
    { value: ListStyle.SQUARE, name: '方块列表' },
]

export const defaultSeparatorOptions:IOptionsItem[] = [
    { value: '0,0', name: 'separator-0_0' },
    { value: '1,1', name: 'separator-1_1' },
    { value: '3,1', name: 'separator-3_1' },
    { value: '4,4', name: 'separator-4_4' },
    { value: '7,3,3,3', name: 'separator-7_3_3_3' },
    { value: '6,2,2,2,2,2', name: 'separator-6_2_2_2_2_2' },
]


export const defaultTitleOptions = [
    { value: 16, name: '正文', level: '' },
    { value: 26, name: '标题1', level: 'first' },
    { value: 24, name: '标题2', level: 'second' },
    { value: 22, name: '标题3', level: 'third' },
    { value: 20, name: '标题4', level: 'fourth' },
    { value: 18, name: '标题5', level: 'fifth' },
    { value: 16, name: '标题6', level: 'sixth' },
]

  // 对齐方式
export const defaultAlignWay = [
    { value: 'left', label: '左对齐' },
    { value: 'center', label: '居中对齐' },
    { value: 'right', label: '右对齐' },
]