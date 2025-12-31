import request from "@/utils/request";

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

//销售数量排行新的
export function getRankingNumNew(data) {
  return request({
    url: "/server/report_product/orderRankingNumNew",
    method: "post",
    data: data,
  });
}

//销售金额排行新的
export function getRankingNumAmount(data) {
  return request({
    url: "/server/report_product/orderRankingAmountNew",
    method: "post",
    data: data,
  });
}
