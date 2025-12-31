import request from "@/utils/request";

// 获取总数据（饼图）
export function getTotalList(data) {
  return request({
    url: "/server/storeReports/getStoreTotalOrderData",
    method: "post",
    data,
  });
}

// 获取平台店铺信息
export function getStoreInfo() {
  return request({
    url: "/server/storeReports/getPlatformStore",
    method: "get",
  });
}

// 获取店铺时间维度的柱状图数据
export function getHistogramData(data) {
  return request({
    url: "/server/storeReports/getStoreHistogramOrderData",
    method: "post",
    data,
  });
}

// 获取店铺的销售数据
export function getStoreOrderData(data) {
  return request({
    url: "/server/storeReports/getStoreOrderData",
    method: "post",
    data,
  });
}

// 获取链接畅销榜数据
export function getUrlSellData(data) {
  return request({
    url: "/server/storeReports/getUrlSellData",
    method: "post",
    data,
  });
}

// 获取链接退货榜数据
export function getUrlRefundData(data) {
  return request({
    url: "/server/storeReports/getUrlRefundData",
    method: "post",
    data,
  });
}

// 获取总订单数
export function getTotalData(data) {
  return request({
    url: "/server/storeReports/getTotalOrderData",
    method: "post",
    data,
  });
}
