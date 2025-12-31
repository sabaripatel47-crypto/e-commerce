import request from "@/utils/request";

// 获取补发数量金额
export function getReissue(data) {
  return request({
    url: "/server/deliveryCost/reissue",
    method: "post",
    data,
  });
}

// 获取换货数量金额
export function getExchange(data) {
  return request({
    url: "/server/deliveryCost/change",
    method: "post",
    data,
  });
}

// 获取缺货赔偿数量金额
export function getShortageCompensation(data) {
  return request({
    url: "/server/deliveryCost/shortageCompensation",
    method: "post",
    data,
  });
}

// 获取售后补偿数量金额
export function getAfterSale(data) {
  return request({
    url: "/server/deliveryCost/afterSale",
    method: "post",
    data,
  });
}

// 获取平台费用数量金额
export function getPlatformCost(data) {
  return request({
    url: "/server/deliveryCost/platformCost",
    method: "post",
    data,
  });
}

// 获取仅退款数量金额
export function getAfterSalesRefund(data) {
  return request({
    url: "/server/deliveryCost/afterSalesRefund",
    method: "post",
    data,
  });
}

// 获取拦截数量金额
export function getIntercept(data) {
  return request({
    url: "/server/deliveryCost/intercept",
    method: "post",
    data,
  });
}

// 获取退货退款数量金额
export function getReturnAndRefund(data) {
  return request({
    url: "/server/deliveryCost/returnAndRefund",
    method: "post",
    data,
  });
}

// 获取退款不退货数量金额
export function getRefundNoReturn(data) {
  return request({
    url: "/server/deliveryCost/returnNotRefund",
    method: "post",
    data,
  });
}

// 获取交付费用趋势图
export function getDeliveryCostList(data) {
  return request({
    url: "/server/deliveryCost/deliveryCostList",
    method: "post",
    data,
  });
}

// 获取产品下链接维度列表
export function getDeliveryCostToLinkList(data) {
  return request({
    url: "/server/deliveryCost/deliveryCostToLinkList",
    method: "post",
    data,
  });
}

// 获取产品下订单维度列表
export function getDeliveryCostToOrderList(data) {
  return request({
    url: "/server/deliveryCost/deliveryCostToOrderList",
    method: "post",
    data,
  });
}

// 获取产品维度的列表
export function getDeliveryCostToSpuList(data) {
  return request({
    url: "/server/deliveryCost/deliveryCostToSpuList",
    method: "post",
    data,
  });
}

// 获取sku列表
export function getDeliveryCostToSkuList(data) {
  return request({
    url: "/server/deliveryCost/deliveryCostToSkuList",
    method: "post",
    data,
  });
}

// 获取数据更新时间
export function getdataUpdateTime() {
  return request({
    url: "/server/deliveryCost/dataUpdateTime",
    method: "get",
  });
}

// 合计查询
export function getTotal(data) {
  return request({
    url: "/server/deliveryCost/total",
    method: "post",
    data,
  });
}