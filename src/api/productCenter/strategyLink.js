import request from "@/utils/request";

// 根据项目获取链接下拉框数据
export function getLinkSelectList(query) {
  return request({
    url: "/server/strategy/statistics/portrait/strategy_uuid",
    method: "get",
    params: query,
  });
}

// 获取项目下拉框
export function getStrategySelect() {
  return request({
    url: "/server/strategy/statistics/strategy/pull",
    method: "get",
  });
}

// 获取项目下商品链接详情数据
export function getGradeDetail(data) {
  return request({
    url: "/server/strategy/statistics/portrait/link_goods",
    method: "POST",
    data: data,
  });
}

// 数据总览
export function getOverview(data) {
  return request({
    url: "/server/strategy/statistics/portrait/signboard",
    method: "post",
    data: data,
  });
}

// 订单、退单数饼状图
export function getOrderNum(data) {
  return request({
    url: "/server/strategy/statistics/portrait/order_num",
    method: "post",
    data: data,
  });
}

// 订单、退款额饼状图
export function getOrderSale(data) {
  return request({
    url: "/server/strategy/statistics/portrait/order_amount",
    method: "post",
    data: data,
  });
}

// 订单、退单数柱状图
export function getOrderNumHistogram(data) {
  return request({
    url: "/server/strategy/statistics/portrait/rack/order_num",
    method: "post",
    data: data,
  });
}

// 订单、退单金额折线图
export function getOrderSalesLineChart(data) {
  return request({
    url: "/server/strategy/statistics/portrait/rack/order_amount",
    method: "post",
    data: data,
  });
}

// 链接销售额排行榜
export function getOrderRankingSale(data) {
  return request({
    url: "/server/strategy/statistics/portrait/ranking/order_amount",
    method: "post",
    data: data,
  });
}

// 链接销售数量排行榜
export function getOrderRankingNum(data) {
  return request({
    url: "/server/strategy/statistics/portrait/ranking/order_num",
    method: "post",
    data: data,
  });
}

// 链接退款额排行榜
export function getRefundRankingSale(data) {
  return request({
    url: "/server/strategy/statistics/portrait/ranking/refund_order_amount",
    method: "post",
    data: data,
  });
}

// 链接退款数量排行榜
export function getRefundRankingNum(data) {
  return request({
    url: "/server/strategy/statistics/portrait/ranking/refund_order_num",
    method: "post",
    data: data,
  });
}

// 退单量退单率折线图
export function getLinkRefundLineChart(data) {
  return request({
    url: "/server/strategy/statistics/portrait/refund_num",
    method: "post",
    data: data,
  });
}
