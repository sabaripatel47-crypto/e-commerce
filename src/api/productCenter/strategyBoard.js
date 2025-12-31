import request from "@/utils/request";

// 数据总览
export function getOverview(data) {
  return request({
    url: "/server/strategy/statistics/query/signboard",
    method: "post",
    data: data,
  });
}

// 数据总览(退款额、退货量)
export function getRefundOverview(data) {
  return request({
    url: "/server/strategy/statistics/query/signboard_category",
    method: "post",
    data: data,
  });
}

// 获取项目详情数据
export function getStrategyDetail(data) {
  return request({
    url: "/server/strategy/statistics/query/details",
    method: "post",
    data: data,
  });
}

// 获取赛道下拉框
export function getTrackSelect() {
  return request({
    url: "/server/strategy/statistics/tree/track",
    method: "get",
  });
}

// 获取品类下拉框
export function getCategorySelect() {
  return request({
    url: "/server/strategy/statistics/tree/category",
    method: "get",
  });
}

// 获取项目等级下拉框
export function getStrategyGradeSelect() {
  return request({
    url: "/server/strategy/statistics/strategy_status",
    method: "get",
  });
}

// 获取项目下拉框
export function getStrategySelect() {
  return request({
    url: "/server/strategy/statistics/strategy/pull",
    method: "get",
  });
}

// 订单数饼状图
export function getOrderNum(data) {
  return request({
    url: "/server/strategy/statistics/circle/order_num",
    method: "post",
    data: data,
  });
}

// 订单额、退单额饼状图
export function getOrderSale(data) {
  return request({
    url: "/server/strategy/statistics/circle/order_amount",
    method: "post",
    data: data,
  });
}

// 订单数柱状图
export function getOrderNumHistogram(data) {
  return request({
    url: "/server/strategy/statistics/columnar/order_num",
    method: "post",
    data: data,
  });
}

// 订单金额折线图
export function getOrderSalesLineChart(data) {
  return request({
    url: "/server/strategy/statistics/columnar/order_amount",
    method: "post",
    data: data,
  });
}

// 销售额排行榜
export function getOrderRankingSale(data) {
  return request({
    url: "/server/strategy/statistics/columnar/ranking/order_amount",
    method: "post",
    data: data,
  });
}

// 销售数量排行榜
export function getOrderRankingNum(data) {
  return request({
    url: "/server/strategy/statistics/columnar/ranking/order_num",
    method: "post",
    data: data,
  });
}

// 退款额排行榜
export function getRefundRankingSale(data) {
  return request({
    url: "/server/strategy/statistics/columnar/ranking/refund_order_amount",
    method: "post",
    data: data,
  });
}

// 退款数量排行榜
export function getRefundRankingNum(data) {
  return request({
    url: "/server/strategy/statistics/columnar/ranking/refund_order_num",
    method: "post",
    data: data,
  });
}

// 退单量退单率折线图
export function getRefundLineChart(data) {
  return request({
    url: "/server/strategy/statistics/columnar/refund_num",
    method: "post",
    data: data,
  });
}

// 项目器型下拉
export function shape() {
  return request({
    url: "/server/strategy/statistics/tree/shape",
    method: "get",
  });
}

// 项目价格带下拉
export function price() {
  return request({
    url: "/server/strategy/statistics/tree/price_zone",
    method: "get",
  });
}

// 项目人群下拉
export function crowd() {
  return request({
    url: "/server/strategy/statistics/tree/crowd",
    method: "get",
  });
}
