import { isNull, isNil } from "lodash";

// 根据统计类型，返回不同的单元格值
export function fromStatisticsType(obj, type, istable, staKeyArr) {
  // staKeyArr 同比环比数据的key
  let res;
  type = parseInt(type);
  let { d1, d2, d3 } = formattingRecord(obj, type, istable, staKeyArr);

  switch (type) {
    case 2: // 订单数(占比)/等级
      let showStr;
      if (`${d3}` === "-") {
        showStr = `${d1}(${d2})`;
      } else {
        showStr = `${d1}(${d2})/实际等级：${d3}`;
      }
      istable ? (res = showStr) : (res = [d1]);
      return res;
    case 1:
    case 3:
    case 4:
    case 5:
    case 6: // 销售额(占比)// 商品数量(占比),退款额(占比),退单数(占比),退单商品数量(占比)
      istable ? (res = `${d1}(${d2})`) : (res = [d1]);
      return res;
    case 7:
    case 8:
    case 9: // 退单率,// 客单价,// 件单量
      istable ? (res = `${d1}`) : (res = [d1]);
      return res;
    case 10:
    case 11:
    case 12: // 销售额同比环比 // 订单数同比环比,//商品数量的同比环比
      istable ? (res = `同比：${d1}；环比：${d2}`) : (res = [[d1, d2]]);
      return res;
  }
}

// TODO：设置退单率为百分比
// 根据统计类型，设置d1，d2,d3的值
export function formattingRecord(obj, type, istable, staKeyArr) {
  let d1, d2, d3;
  if (isNull(obj.recordData1)) {
    if (staKeyArr.includes(type)) {
      d1 = "-";
    } else {
      istable ? (d1 = "-") : (d1 = 0);
    }
  } else {
    if (staKeyArr.includes(type)) {
      d1 = (obj.recordData1 * 100).toFixed(2) + "%";
    } else if (type === 7) {
      d1 = (obj.recordData1 * 100).toFixed(2) + "%";
    } else {
      d1 = obj.recordData1;
    }
  }

  if (isNull(obj.recordData2)) {
    if (staKeyArr.includes(type)) {
      d2 = "-";
    } else {
      istable ? (d2 = "-") : (d2 = 0);
    }
  } else {
    d2 = (obj.recordData2 * 100).toFixed(2) + "%";
  }

  if (isNull(obj.recordData3)) {
    istable ? (d3 = "-") : (d3 = 0);
  } else {
    d3 = obj.recordData3;
  }

  return {
    d1,
    d2,
    d3,
  };
}

// 设置单元格颜色
export function setItemColor(origin) {
  if (isNil(origin)) return;
  if (origin === "-") return;

  // 移除百分号
  const numStr = origin.replace("%", "");
  // 尝试将字符串转换为浮点数
  const num = parseFloat(numStr);
  // 检查是否为有效的数字
  if (!isNaN(num)) {
    // 使用 Math.sign() 判断数字的符号
    if (num > 0) {
      return "red";
    } else if (num < 0) {
      return "green";
    }
  }
}
