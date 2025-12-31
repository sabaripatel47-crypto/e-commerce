import request from "@/utils/request";

//数据总览
export function getOverview(data) {
  return request({
    url: "/server/report_salesman/overview",
    method: "post",
    data: data,
  });
}
//订单数饼状图
export function getOrderNum(data) {
  return request({
    url: "/server/report_salesman/orderNum",
    method: "post",
    data: data,
  });
}

//订单数饼状图
export function getOrderSale(data) {
  return request({
    url: "/server/report_salesman/orderSales",
    method: "post",
    data: data,
  });
}
//订单数柱状图
export function getOrderNumHistogram(data) {
  return request({
    url: "/server/report_salesman/orderNumHistogram",
    method: "post",
    data: data,
  });
}

//订单金额折线图
export function getOrderSalesLineChart(data) {
  return request({
    url: "/server/report_salesman/orderSalesLineChart",
    method: "post",
    data: data,
  });
}

//销售额排行榜
export function getOrderRankingSale(data) {
  return request({
    url: "/server/report_salesman/orderRankingSale",
    method: "post",
    data: data,
  });
}

//销售数量排行榜
export function getOrderRankingNum(data) {
  return request({
    url: "/server/report_salesman/orderRankingNum",
    method: "post",
    data: data,
  });
}

//退款额排行榜
export function getRefundRankingSale(data) {
  return request({
    url: "/server/report_salesman/refundRankingSale",
    method: "post",
    data: data,
  });
}

//退款数量排行榜
export function getRefundRankingNum(data) {
  return request({
    url: "/server/report_salesman/refundRankingNum",
    method: "post",
    data: data,
  });
}
