import request from "@/utils/request";

// 平台下拉框
export function getPlatformSelect() {
  return request({
    url: "/server/promotion/upload/push/platform",
    method: "get",
  });
}

//店铺下拉框
export function listStore(platform) {
  return request({
    url: `/server/promotion/store/push/${platform}`,
    method: "get",
  });
}
// 项目下拉
export function listStrategy() {
  return request({
    url: `/server/promotion/strategy/push`,
    method: "get",
  });
}

// 获取链接表格
export function getLinkPromotionList(data) {
  return request({
    url: "/server/promotion/linkTable",
    method: "post",
    data,
  });
}

// 链接子表
export function getLinkPromotionChildList(data) {
  return request({
    url: "/server/promotion/linkTableDetail",
    method: "post",
    data,
  });
}

// 获取推广费用数据
export function getPromotionFee(data) {
  return request({
    url: "/server/promotion/cost",
    method: "post",
    data,
  });
}

// 获取销售额、销售数量
export function getPromotionSales(data) {
  return request({
    url: "/server/promotion/sales",
    method: "post",
    data,
  });
}

// 获取实际销售金额、退货量
export function getPromotionActualSales(data) {
  return request({
    url: "/server/promotion/actualSales",
    method: "post",
    data,
  });
}

// 推广占比
export function getPromotionRatio(data) {
  return request({
    url: "/server/promotion/percentage",
    method: "post",
    data,
  });
}

// 订单数
export function getPromotionOrder(data) {
  return request({
    url: "/server/promotion/quantity",
    method: "post",
    data,
  });
}

// 退单数
export function getPromotionReturnOrder(data) {
  return request({
    url: "/server/promotion/quantityRefund",
    method: "post",
    data,
  });
}

// 获取推广方式
export function getPromotionType(platform) {
  return request({
    url: `/server/promotion/upload/uploadType/${platform}`,
    method: "get",
  });
}

// 获取实际推广占比

export function getPromotionActualRatio(data) {
  return request({
    url: "/server/promotion/percentage_actual",
    method: "post",
    data,
  });
}

// 获取最新更新时间
export function getPromotionUpdateTime() {
  return request({
    url: "/server/promotion/newTime",
    method: "get",
  });
}
