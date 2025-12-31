import request from "@/utils/request";

// 获取申请类型下拉框列表
export function getApplyTypeSelectList() {
  return request({
    url: "/server/public/applyTypePush",
    method: "get",
  });
}

// 获取审核状态下拉框列表
export function getAuditStatusSelectList() {
  return request({
    url: "/server/public/examinePurchasePush",
    method: "get",
  });
}

// 获取提交状态下拉框列表
export function getSubmitStatusSelectList() {
  return request({
    url: "/server/public/submitTypePush",
    method: "get",
  });
}

// 获取全量sku下拉框数据
export function getLinkSkuSelectList(data) {
  return request({
    url: "/server/public/purchaseToSkulist",
    method: "post",
    data: data,
  });
}

// 获取趋势图列表数据
export function getTrendTableList(data) {
  return request({
    url: "/server/operation/getTrendTable",
    method: "post",
    data: data,
  });
}

// 获取趋势图的折线图数据
export function getTrendLineList(data) {
  return request({
    url: "/server/operation/getLineChart",
    method: "post",
    data: data,
  });
}

// 链接等级下拉框
export function getLinkLevelSelectList() {
  return request({
    url: "/server/public/linkPush",
    method: "get",
  });
}
