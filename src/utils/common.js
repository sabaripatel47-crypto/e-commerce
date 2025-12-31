export function getDeptTreeData(treeData) {
  for (let i = 0; i < treeData.length; i++) {
    const node = treeData[i];
    if (
      node.children &&
      node.children.length === 0 &&
      node.memberList &&
      node.memberList.length > 0
    ) {
      node.children.unshift(...node.memberList);
    } else if (
      node.children &&
      node.children.length === 0 &&
      node.memberList &&
      node.memberList.length === 0
    ) {
      delete node.children;
    } else if (
      node.children &&
      node.children.length > 0 &&
      node.memberList &&
      node.memberList.length > 0
    ) {
      node.children.unshift(...node.memberList);
      getDeptTreeData(node.children);
    } else if (node.children && node.children.length > 0) {
      getDeptTreeData(node.children);
    }
  }
  return treeData;
}

/**
 * @param {Object} source
 * @description 深拷贝
 */
export function deepClone(source) {
  if (!source || typeof source !== "object") {
    throw new Error("error arguments", "shallowClone");
  }
  let targetObj = source.constructor === Array ? [] : {};
  for (var keys in source) {
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === "object") {
        targetObj[keys] = source[keys].constructor === Array ? [] : {};
        targetObj[keys] = deepClone(source[keys]);
      } else {
        targetObj[keys] = source[keys];
      }
    }
  }
  return targetObj;
}

//1、获取时间戳对应的时间，格式YYYY-MM-DD
export function getFormatDate(timeStamp) {
  var date = new Date(+timeStamp);

  let seperator1 = "-";
  let Y = date.getFullYear(),
    M =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1,
    D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  return Y + seperator1 + M + seperator1 + D;
}

//2、获取时间戳对应的时间，格式YYYY-MM-DD HH:mm:dd
export function getFormatDateTime(timeStamp) {
  var date = new Date(timeStamp);

  let seperator1 = "-";
  let Y = date.getFullYear(),
    M =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1,
    D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
    h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
    m = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
    s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

  return Y + seperator1 + M + seperator1 + D + " " + h + ":" + m + ":" + s;
}

//3、获取时间戳对应的时间，格式YYYY-MM
export function getFormaMonth(timeStamp) {
  var date = new Date(timeStamp);

  let seperator1 = "-";
  let Y = date.getFullYear(),
    M =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;

  return Y + seperator1 + M;
}

//3、获取昨天午夜的时间戳
export function getYesterdayMidnightTimestamp() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1); // 减去一天得到昨天的日期
  yesterday.setHours(0, 0, 0, 0); // 设置时间为午夜
  return yesterday.getTime(); // 返回昨天午夜的时间戳
}

// 获取固定时间的日期
export function addDay(day, timeStamp) {
  let date;
  if (timeStamp) {
    date = new Date(timeStamp);
  } else {
    date = new Date();
  }

  date.setDate(date.getDate() + day); // 减去一天得到昨天的日期
  date.setHours(0, 0, 0, 0); // 设置时间为午夜
  return date.getTime(); // 返回昨天午夜的时间戳
}

// 获取上周周一的时间
export function getLastWeekMonday() {
  const now = new Date();
  let lastMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 当前周一
  lastMonday.setDate(lastMonday.getDate() - (now.getDay() - 1) - 7); // 减去当前星期天数，再减去7天
  return lastMonday;
}

//取昨天时间的最后一刻,23:59:59
export function addDayEnd(day, timeStamp) {
  let date;
  if (timeStamp) {
    date = new Date(timeStamp);
  } else {
    date = new Date();
  }

  date.setDate(date.getDate() + day); // 减去一天得到昨天的日期
  date.setHours(23, 59, 59, 59); // 设置时间为午夜
  return date.getTime(); // 返回昨天午夜的时间戳
}

// 获取数组最后一个值
export function getLastValue(arr) {
  if (Array.isArray(arr)) {
    return arr[arr.length - 1];
  }
  return arr;
}

// 转null为 -
export function nullToComponent(value) {
  if (value === null) {
    return "-";
  }
  return value;
}
