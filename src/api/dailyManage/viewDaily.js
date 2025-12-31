import request from "@/utils/request";

// 查看日报数据列表
export function getLeaderLinkDailyList(data) {
  return request({
    url: "/server/daily/leaderList",
    method: "post",
    data: data,
  });
}

// 查看日报的详情
export function getViewDailyDetail(data) {
  return request({
    url: `/server/daily/showDaily `,
    method: "post",
    data: data,
  });
}

//添加反馈
export function addFeedback(data) {
  return request({
    url: "/server/daily/addFeedback",
    method: "put",
    data: data,
  });
}

//加购率的折线图的数据
export function getPurchaseLineChart(data) {
  return request({
    url: `/server/daily/purchaseRate`,
    method: "post",
    data: data,
  });
}

//收藏率的折线图的数据
export function getCollectionLineChart(data) {
  return request({
    url: `/server/daily/collectionRate`,
    method: "post",
    data: data,
  });
}

//退货率的折线图的数据
export function getRefundLineChart(data) {
  return request({
    url: `/server/daily/refundRate`,
    method: "post",
    data: data,
  });
}

//转换率的折线图的数据
export function getConversionLineChart(data) {
  return request({
    url: `/server/daily/conversionRate`,
    method: "post",
    data: data,
  });
}

//点击率的折线图的数据
export function getClickThroughLineChart(data) {
  return request({
    url: `/server/daily/clickThroughRate`,
    method: "post",
    data: data,
  });
}

//搜索转化率
export function getSearchConversionRateChart(data) {
  return request({
    url: `/server/daily/searchConversionRate`,
    method: "post",
    data: data,
  });
}

//UV价值
export function getUVCostChart(data) {
  return request({
    url: `/server/daily/UVCost`,
    method: "post",
    data: data,
  });
}

//平均停留时长
export function getaverageDurationChart(data) {
  return request({
    url: `/server/daily/averageDuration`,
    method: "post",
    data: data,
  });
}

//支付件数
export function getPayCountChart(data) {
  return request({
    url: `/server/daily/payCount`,
    method: "post",
    data: data,
  });
}

//支付买家数
export function getPayingBuyersCountChart(data) {
  return request({
    url: `/server/daily/payingBuyersCount`,
    method: "post",
    data: data,
  });
}

//商品访客数
export function getVisitorsCountChart(data) {
  return request({
    url: `/server/daily/visitorsCount`,
    method: "post",
    data: data,
  });
}

//加购人数
export function getRepeatPurchaseCountChart(data) {
  return request({
    url: `/server/daily/repeatPurchaseCount`,
    method: "post",
    data: data,
  });
}

//搜索访客
export function getSearchVisitorsChart(data) {
  return request({
    url: `/server/daily/searchVisitors`,
    method: "post",
    data: data,
  });
}

//支付金额
export function getPayAmountChart(data) {
  return request({
    url: `/server/daily/payAmount`,
    method: "post",
    data: data,
  });
}

//退款金额
export function getRefundAmountChart(data) {
  return request({
    url: `/server/daily/refundAmount`,
    method: "post",
    data: data,
  });
}
