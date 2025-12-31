import request from "@/utils/request";

// 库存数量
export function getStockNumber() {
  return request({
    url: "/server/deliverycenter/allStock",
    method: "get",
  });
}

// 订单数
export function getOrderNumber(data) {
  return request({
    url: "/server/deliverycenter/orderQuantity",
    method: "post",
    data,
  });
}

// 售后咨询量
export function getConsultationNumber(data) {
  return request({
    url: "/server/afterSale/afterSaleNumber",
    method: "post",
    data,
  });
}

// 销售额、商品数量
export function getSalesNumber(data) {
  return request({
    url: "/server/deliverycenter/salesAmount",
    method: "post",
    data,
  });
}

//
export function getDeliveryCostNumber(data) {
  return request({
    url: "/server/deliveryCost/deliveryCostAll",
    method: "post",
    data,
  });
}

// 数据更新时间
export function getUpdateTime() {
  return request({
    url: "/server/afterSale/afterSale_dataUpdateTime",
    method: "get",
  });
}
