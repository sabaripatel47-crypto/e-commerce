import request from "@/utils/request";

// 根据店铺获取链接下拉框
export function getLinkSelectList(data) {
  return request({
    url: "/server/link_manage/storeToLinkPush",
    method: "post",
    data: data,
  });
}

// 查看商品看板当前等级详情
export function getGradeDetail(data) {
  return request({
    url: "/server/report_link/getLinkGrade",
    method: "post",
    data: data,
  });
}

// 数据总览
export function getOverview(data) {
  return request({
    url: "/server/report_link/overview",
    method: "post",
    data: data,
  });
}

// 订单、退单数饼状图
export function getOrderNum(data) {
  return request({
    url: "/server/report_link/orderNum",
    method: "post",
    data: data,
  });
}

// 订单、退款额饼状图
export function getOrderSale(data) {
  return request({
    url: "/server/report_link/orderSales",
    method: "post",
    data: data,
  });
}

// 订单、退单数柱状图
export function getOrderNumHistogram(data) {
  return request({
    url: "/server/report_link/orderNumHistogram",
    method: "post",
    data: data,
  });
}

// 订单、退单金额折线图
export function getOrderSalesLineChart(data) {
  return request({
    url: "/server/report_link/orderSalesLineChart",
    method: "post",
    data: data,
  });
}

// 链接销售额排行榜
export function getOrderRankingSale(data) {
  return request({
    url: "/server/report_link/orderRanking",
    method: "post",
    data: data,
  });
}

// 链接销售数量排行榜
export function getOrderRankingNum(data) {
  return request({
    url: "/server/report_link/orderRankingNum",
    method: "post",
    data: data,
  });
}

// 链接退款额排行榜
export function getRefundRankingSale(data) {
  return request({
    url: "/server/report_link/refundRanking",
    method: "post",
    data: data,
  });
}

// 链接退款数量排行榜
export function getRefundRankingNum(data) {
  return request({
    url: "/server/report_link/refundRankingNum",
    method: "post",
    data: data,
  });
}

// SKU销售数量排行榜
export function getSkuOrderRankingNum(data) {
  return request({
    url: "/server/report_link/orderRankingNumToSku",
    method: "post",
    data: data,
  });
}

// SKU销售额排行榜
export function getSkuOrderRankingSale(data) {
  return request({
    url: "/server/report_link/orderRankingToSku",
    method: "post",
    data: data,
  });
}

// SKU退款额排行榜
export function getSkuRefundRankingSale(data) {
  return request({
    url: "/server/report_link/refundRankingToSku",
    method: "post",
    data: data,
  });
}

// SKU退款数量排行榜
export function getSkuRefundRankingNum(data) {
  return request({
    url: "/server/report_link/refundRankingNumToSku",
    method: "post",
    data: data,
  });
}

// 退单量退单率折线图
export function getLinkRefundLineChart(data) {
  return request({
    url: "/server/report_link/refundNumber",
    method: "post",
    data: data,
  });
}

// 加购率
export function getPurchaseRate(data) {
  return request({
    url: "/server/report_link/purchaseRate",
    method: "post",
    data: data,
  });
}

// 收藏率
export function getCollectionRate(data) {
  return request({
    url: "/server/report_link/collectionRate",
    method: "post",
    data: data,
  });
}

// 退货率
export function getRefundRate(data) {
  return request({
    url: "/server/report_link/refundRate",
    method: "post",
    data: data,
  });
}

// 转换率
export function getConversionRate(data) {
  return request({
    url: "/server/report_link/conversionRate",
    method: "post",
    data: data,
  });
}

// 点击率
export function getClickThroughRate(data) {
  return request({
    url: "/server/report_link/clickThroughRate",
    method: "post",
    data: data,
  });
}

/* // 真实转换率
export function getTrueConversionRate(data) {
  return request({
    url: "/server/report_link/trueConversionRate",
    method: "post",
    data: data,
  });
}

// 增长率
export function getGrowthRate(data) {
  return request({
    url: "/server/report_link/growthRate",
    method: "post",
    data: data,
  });
}

// 差评率
export function getNegativeReviewRate(data) {
  return request({
    url: "/server/report_link/negativeReviewRate",
    method: "post",
    data: data,
  });
} */

// 访客数
export function getVisitorNum(data) {
  return request({
    url: "/server/promotion/visitor",
    method: "post",
    data: data,
  });
}

// 销售数量饼图
export function getSaleNum(data) {
  return request({
    url: "/server/report_link/orderNumber",
    method: "post",
    data: data,
  });
}

// 销售数量折线图
export function getSaleNumLineChart(data) {
  return request({
    url: "/server/report_link/orderNumberLineChart",
    method: "post",
    data: data,
  });
}

// 推广费用饼图
export function getPromotion(data) {
  return request({
    url: "/server/promotion/promotionPie",
    method: "post",
    data: data,
  });
}

// 推广费用柱状图
export function getPromotionFeeHistogram(data) {
  return request({
    url: "/server/promotion/promotionHistogram",
    method: "post",
    data: data,
  });
}

// 推广费用表格
export function getPromotionFeeTable(data) {
  return request({
    url: "/server/promotion/promotionPlanDetail",
    method: "post",
    data: data,
  });
}

// 推广费用-占比
export function getPromotionFeeProportion(data) {
  return request({
    url: "/server/promotion/percentage_link",
    method: "post",
    data: data,
  });
}