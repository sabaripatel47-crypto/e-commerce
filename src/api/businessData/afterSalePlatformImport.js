import request from "@/utils/request";

// 获取售后平台列表
export function getAfterSalePlatformList(data) {
  return request({
    url: "/server/newProducts/list",
    method: "post",
    data
  });
}

// 拼多多导入
export function importPdd(data) {
  return request({
    url: "/server/newProducts/pdd/upload",
    method: "post",
    data
  });
}

// 京东导入
export function importJd(data) {
  return request({
    url: "/server/newProducts/jd/upload",
    method: "post",
    data
  });
}

// 抖音导入
export function importDouyin(data) {
  return request({
    url: "/server/newProducts/dy/upload",
    method: "post",
    data
  });
}

// 天猫导入
export function importTmall(data) {
  return request({
    url: "/server/newProducts/tm/upload",
    method: "post",
    data
  });
}

// 删除数据
export function deleteAfterSalePlatform(uuid) {
  return request({
    url: `/server/newProducts/delete/${uuid}`,
    method: "delete",
  });
}

// 获取数据状态
export function getAfterSalePlatformStatus(uuid) {
  return request({
    url: `/server/newProducts/getRecordsStatus/${uuid}`,
    method: "get",
  });
}