import request from "@/utils/request";

// 数据总览
export function getOverview(data) {
  return request({
    url: "/server/store_report/overview",
    method: "post",
    data: data,
  });
}
// 订单数饼状图
export function getOrderNum(data) {
  return request({
    url: "/server/store_report/orderNum",
    method: "post",
    data: data,
  });
}

// 订单数饼状图
export function getOrderSale(data) {
  return request({
    url: "/server/store_report/orderSales",
    method: "post",
    data: data,
  });
}
// 订单数柱状图
export function getOrderNumHistogram(data) {
  return request({
    url: "/server/store_report/orderNumHistogram",
    method: "post",
    data: data,
  });
}

// 订单金额折线图
export function getOrderSalesLineChart(data) {
  return request({
    url: "/server/store_report/orderSalesLineChart",
    method: "post",
    data: data,
  });
}

// 销售额排行榜
export function getOrderRankingSale(data) {
  return request({
    url: "/server/store_report/orderRanking",
    method: "post",
    data: data,
  });
}

// 销售数量排行榜
export function getOrderRankingNum(data) {
  return request({
    url: "/server/store_report/orderRankingNum",
    method: "post",
    data: data,
  });
}

// 退款额排行榜
export function getRefundRankingSale(data) {
  return request({
    url: "/server/store_report/refundRanking",
    method: "post",
    data: data,
  });
}

// 退款数量排行榜
export function getRefundRankingNum(data) {
  return request({
    url: "/server/store_report/refundRankingNum",
    method: "post",
    data: data,
  });
}

// 退单量退单率折线图
export function getRefundLineChart(data) {
  return request({
    url: "/server/store_report/refundNumber",
    method: "post",
    data: data,
  });
}
