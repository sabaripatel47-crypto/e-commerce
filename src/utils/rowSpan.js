import { groupBy } from 'lodash'

// 表格数据项
// 第二个参数代表合并的参照维度，如当前例子中传入的'species'，表示表格数据中'species'字段相同的数据项应该被合并
// 第三个参数用于指定合并单元格被应用于哪一列上
export const rowSpan = function (list, spanPath, columnNames, row, column) {
  const rowSpanHandler = function (list, handledSpanPath) {
    if (!handledSpanPath) {
      return
    }
    const spanPathList = handledSpanPath.split('.').filter(Boolean)
    const fieldName = spanPathList.shift()
    const groups = Object.values(groupBy(list, fieldName))
    groups.forEach(group => {
      group.forEach(function (item, index) {
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
  return function ({ row, column }) {
    console.log('column: ', column.property)
    console.log('column===: ', column.property === columnNames[0])
    if (columnNames.includes(column.property)) {
      console.log('======: ', row[`span_${spanPath.split('.').join('_')}`])
      return row[`span_${spanPath.split('.').join('_')}`]
    }
  }
}

export const combine = (...funcArr) => {
  return ({ row, column }) =>
    funcArr.map(item => item({ row, column })).find(Boolean)
}
// const spanMethod = combine(
//   rowSpan(tableData,'species.gender',['gender']),
//   rowSpan(tableData,'species',['species'])
// )
