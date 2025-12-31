import request from "@/utils/request";

// 核对状态下拉
export function getNotarizeStatus() {
  return request({
    url: "/server/ofld/ofldCheckPush",
    method: "get"
  });
}

// 拉货确认表
export function getNotarizeTable(data) {
  return request({
    url: "/server/ofld/ofldConfirmPage",
    method: "post",
    data
  });
}

// 拉货核对列表
export function getNotarizeList(data) {
  return request({
    url: "/server/ofld/ofldConfirmDetail",
    method: "post",
    data
  });
}

// 保存
export function notarize(data) {
  return request({
    url: "/server/ofld/ofldConfirms",
    method: "post",
    data
  });
}

// 核销
export function notarizeWriteOff(data) {
  return request({
    url: "/server/ofld/ofldConfirmsOk",
    method: "post",
    data
  });
}

// 已到货明细
export function getArrivedDetail(data) {
  return request({
    url: "/server/ofld/ofldConfirmsDeatilList",
    method: "post",
    data
  });
}

// 批量核销
export function batchNotarize(data) {
  return request({
    url: "/server/ofld/ofldConfirmsBatchOk",
    method: "post",
    data
  });
}