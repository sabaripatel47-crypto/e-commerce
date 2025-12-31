import request from "@/utils/request";


// 负责人下拉
export function getPrincipalList() {
  return request({
    url: `/server/files/department`,
    method: "get",
  })
}

// 店铺名称下拉框
export function listPush() {
  return request({
    url: "/server/store_manage/listPush",
    method: "get",
  });
}

// 获取店铺变更列表
export function getStoreChangeStatistics(data) {
  return request({
    url: "/server/store_change/page",
    method: "post",
    data
  });
}