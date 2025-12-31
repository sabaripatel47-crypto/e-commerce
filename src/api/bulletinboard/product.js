import request from "@/utils/request";
//商品看板
//数据总览spu统计
export function getOverview(data) {
  return request({
    url: "/server/report_product/overview",
    method: "post",
    data: data,
  });
}
//数据总览sku统计
// export function getOverviewSku(data) {
//   return request({
//     url: "/server/report_sku/overview",
//     method: "post",
//     data: data,
//   });
// }
//订单数饼状图
export function getOrderNum(data) {
  return request({
    url: "/server/report_product/orderNum",
    method: "post",
    data: data,
  });
}

//订单金额饼状图
export function getOrderSale(data) {
  return request({
    url: "/server/report_product/orderSales",
    method: "post",
    data: data,
  });
}
//订单数柱状图
export function getOrderNumHistogram(data) {
  return request({
    url: "/server/report_product/orderNumHistogram",
    method: "post",
    data: data,
  });
}

//订单金额折线图
export function getOrderSalesLineChart(data) {
  return request({
    url: "/server/report_product/orderSalesLineChart",
    method: "post",
    data: data,
  });
}

//销售额排行榜
export function getOrderRankingSale(data) {
  return request({
    url: "/server/report_product/orderRanking",
    method: "post",
    data: data,
  });
}

//销售数量排行榜
export function getOrderRankingNum(data) {
  return request({
    url: "/server/report_product/orderRankingNum",
    method: "post",
    data: data,
  });
}

//退款额排行榜
export function getRefundRankingSale(data) {
  return request({
    url: "/server/report_product/refundRanking",
    method: "post",
    data: data,
  });
}

//退款数量排行榜
export function getRefundRankingNum(data) {
  return request({
    url: "/server/report_product/refundRankingNum",
    method: "post",
    data: data,
  });
}

//销售额排行榜-新的
export function getOrderRankingSaleNew(data) {
  return request({
    url: "/server/report_product/orderRankingAmountNew",
    method: "post",
    data: data,
  });
}

//销售数量排行榜-新的
export function getOrderRankingNumNew(data) {
  return request({
    url: "/server/report_product/orderRankingNumNew",
    method: "post",
    data: data,
  });
}

//退款额排行榜-新的
export function getRefundRankingSaleNew(data) {
  return request({
    url: "/server/report_product/refundRankingAmount",
    method: "post",
    data: data,
  });
}

//退款数量排行榜-新的
export function getRefundRankingNumNew(data) {
  return request({
    url: "/server/report_product/refundRankingNumNew",
    method: "post",
    data: data,
  });
}

// 获取当前产品等级详情
export function getProductGradeDetail(data) {
  return request({
    url: "/server/report_product/getProductGrade",
    method: "post",
    data: data,
  });
}
