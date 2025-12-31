import request from "@/utils/request";
//商品看板
//数据总览
export function getOverview(data) {
  return request({
    url: "/server/report_sku/overview",
    method: "post",
    data: data,
  });
}
//订单数饼状图
export function getOrderNum(data) {
  return request({
    url: "/server/report_sku/orderNum",
    method: "post",
    data: data,
  });
}

//订单金额饼状图
export function getOrderSale(data) {
  return request({
    url: "/server/report_sku/orderSales",
    method: "post",
    data: data,
  });
}
//订单数柱状图
export function getOrderNumHistogram(data) {
  return request({
    url: "/server/report_sku/orderNumHistogram",
    method: "post",
    data: data,
  });
}

//订单金额折线图
export function getOrderSalesLineChart(data) {
  return request({
    url: "/server/report_sku/orderSalesLineChart",
    method: "post",
    data: data,
  });
}

//销售额排行榜
export function getOrderRankingSale(data) {
  return request({
    url: "/server/report_sku/orderRanking",
    method: "post",
    data: data,
  });
}

//销售数量排行榜
export function getOrderRankingNum(data) {
  return request({
    url: "/server/report_sku/orderRankingNum",
    method: "post",
    data: data,
  });
}

//退款额排行榜
export function getRefundRankingSale(data) {
  return request({
    url: "/server/report_sku/refundRanking",
    method: "post",
    data: data,
  });
}

//退款数量排行榜
export function getRefundRankingNum(data) {
  return request({
    url: "/server/report_sku/refundRankingNum",
    method: "post",
    data: data,
  });
}

//销售额排行榜--新的
export function getOrderRankingSaleAmountNew(data) {
  return request({
    url: "/server/report_sku/orderRankingAmountNew",
    method: "post",
    data: data,
  });
}

//销售数量排行榜--新的
export function getOrderRankingNumNew(data) {
  return request({
    url: "/server/report_sku/orderRankingNumNew",
    method: "post",
    data: data,
  });
}

//退款额排行榜--新的
export function getRefundRankingSaleAmountNew(data) {
  return request({
    url: "/server/report_sku/refundRankingAmount",
    method: "post",
    data: data,
  });
}

//退款数量排行榜--新的
export function getRefundRankingNumNew(data) {
  return request({
    url: "/server/report_sku/refundRankingNumNew",
    method: "post",
    data: data,
  });
}

// 获取当前sku等级详情
export function getProductGradeDetail(uuid) {
  return request({
    url: `/server/report_sku/getDetail/${uuid}`,
    method: "get",
  });
}
