import { ElementType } from '../dataset/enum/Element'
import { IElement } from '../interface/Element'

interface HandleExpressionParam {
    formData:any
    dataSource:any
}

export function handleVisibleExpressionElementList(elementList:IElement[],option:HandleExpressionParam):IElement[]{
    const {formData,dataSource}= option
    let i=0
    while (i < elementList.length) {
        const el = elementList[i]
        if (el.type === ElementType.TABLE  && el.attr && el.attr.visibleExpression) {
            el.visible = getExpressionResult(el.attr.visibleExpression,{
                formData,
                dataSource,
            })
            if (el.trList) {
                for (let t = 0; t < el.trList.length; t++) {
                  const tr = el.trList[t]
                  // if (tr.attr && tr.attr.visibleExpression) {
                  //   tr.visible = getExpressionResult(tr.attr.visibleExpression,{
                  //     formData,
                  //     dataSource,
                  //   })
                  // }
                  for (let d = 0; d < tr.tdList.length; d++) {
                    const td = tr.tdList[d]
                    td.value = handleVisibleExpressionElementList(td.value,option)
                  }
                }
            }
        }else if(
            el.type === ElementType.CONTROL && 
            el.control && 
            el.control.extension &&
            el.control.extension.authData &&
            el.control.extension.authData.visibleExpression
        ){
            el.visible = getExpressionResult(el.control.extension.authData.visibleExpression,{
                formData,
                dataSource,
            })
        }else{
            el.visible = true
        }
        i++
    }
    return elementList
}


export function getExpressionResult(expression: string,option:HandleExpressionParam) {
    // 替换字符串变量
    const {dataSource,formData} = option
    const regex = /\]\+\[|\]-\[|\]\*\[|\]\/\[/
    const isCalcExpression = regex.test(expression) // 是否计算表达式
    // 使用正则表达式替换字符串中的所有 [xxxx]
    const replacedStr = expression.replace(/\[(.*?)\]/g, (_match: string, p1: string) => {
      let value = isCalcExpression ? '0' : ''
      if (p1.indexOf('root.') > -1) {
        // 数据源
        value = dataSource.getValueByKey(p1)
      } else if (formData[p1]) {
        value = formData[p1]
      }
      if (isCalcExpression && typeof value === 'string' && !/^\d+$/.test(value)) {
        value = '0'
      }
      return value
    })
    try {
      return eval(replacedStr)
    } catch (error) {
      return false
    }
  }