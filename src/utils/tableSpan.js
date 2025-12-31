import {groupBy} from 'lodash';
export const rowSpan = (list, spanPath, columnNames) => {
  const rowSpanHandler = (list, handledSpanPath) => {
    if (!handledSpanPath) {
      return
    }
    const spanPathList = handledSpanPath.split('.').filter(Boolean)
    const fieldName = spanPathList.shift()
    const groups = Object.values(groupBy(list , fieldName))
    groups.forEach((group) => {
      group.forEach((item, index) => {
        if (spanPathList.length === 0) {
          const resultPath = spanPath.split('.').join('_')
          if (index === 0) {
            item[`span_${resultPath}`] = [group.length, 1]
          } else {
            item[`span_${resultPath}`] = [0, 0]
          }
        } else {
          rowSpanHandler(group, spanPathList.join('.'))
        }
      })
    })
  }
  rowSpanHandler(list, spanPath)
  return ({ row, column }) => {
    if (columnNames.includes(column.property)) {
      return row[`span_${spanPath.split('.').join('_')}`]
    }
  }
}

export const combine = (...funcArr)=>{
  return ({ row, column })=>funcArr.map(item=>item({row, column})).find(Boolean)
}
