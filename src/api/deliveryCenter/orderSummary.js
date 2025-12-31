import request from "@/utils/request";

// 获取数据更新时间
export function getUpdateTime() {
  return request({
    url: "/server/deliverycenter/dataUpdateTime",
    method: "get",
  });
}

//退单量
export function getRefundOrder(data) {
  return request({
    url: "/server/deliverycenter/refundQuantity",
    method: "post",
    data,
  });
}

// 退货数量、退货率、实际商品数量
export function getRefundGoods(data) {
  return request({
    url: "/server/deliverycenter/refundNum",
    method: "post",
    data,
  })
}

// 退货率计算，实际订单数
export function getActualOrder(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityRate",
    method: "post",
    data,
  })
}

// 退单量柱状图
export function getRefundOrderBar(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityHistogram",
    method: "post",
    data,
  })
}

// 退货数量，退货率柱状图、实际商品数量柱状图
export function getRefundGoodsBar(data) {
  return request({
    url: "/server/deliverycenter/refundNumHistogram",
    method: "post",
    data,
  })
}

// 退单率柱状图,实际订单量柱状图
export function getActualOrderBar(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityRateHistogram",
    method: "post",
    data,
  })
}

// 售前退单，售前退货
export function getPreSale(data) {
  return request({
    url: "/server/deliverycenter/afterRefundQuantity",
    method: "post",
    data,
  })
}
// 售前退单率、售前退货率
export function getPreSaleRate(data) {
  return request({
    url: "/server/deliverycenter/afterRefundQuantityRate",
    method: "post",
    data,
  })
}
// 退款不退货退单、退款不退货退货
export function getRefundNoReturn(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityNotGoods",
    method: "post",
    data,
  })
}
// 退款不退货退单率、退款不退货退货率
export function getRefundNoReturnRate(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityNotGoodsRate",
    method: "post",
    data,
  })
}

// 退款退货退单、退款不退货退货
export function getRefundReturn(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityAndGoods",
    method: "post",
    data,
  })
}
// 退款退货退单率、退款退货退货率
export function getRefundReturnRate(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityAndGoodsRate",
    method: "post",
    data,
  })
}

// 售前退款订单、售前退款数量趋势图
export function getPreSaleTrend(data) {
  return request({
    url: "/server/deliverycenter/afterRefundHistogram",
    method: "post",
    data,
  })
}

// 退款退货订单、退款退货数量趋势图
export function getRefundReturnTrend(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityAndGoodsHistogram",
    method: "post",
    data,
  })
}

// 退款不退货订单、退款不退货数量趋势图
export function getRefundNoReturnTrend(data) {
  return request({
    url: "/server/deliverycenter/refundQuantityNotGoodsHistogram",
    method: "post",
    data,
  })
}

// 订单明细

// SPU表格
export function getSPUTable(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_spuTable",
    method: "post",
    data,
  })
}

// SPU下的sku表格
export function getSPUSkuTable(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_skuToSkuTable",
    method: "post",
    data,
  })
}

// SPU下的连接表格
export function getSPUConnTable(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_spuToLinkTable",
    method: "post",
    data,
  })
}

// SPU趋势图
export function getSPUTrend(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_spuTable_chart",
    method: "post",
    data,
  })
}

// SPU下的sku趋势图
export function getSPUSkuTrend(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_skuToSkuTable_chart",
    method: "post",
    data,
  })
}

// SPU下的链接趋势图
export function getSPUConnTrend(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_spuToLinkTable_chart",
    method: "post",
    data,
  })
}

// 店铺表格
export function getShopTable(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_storeTable",
    method: "post",
    data,
  })
}

// 链接sku表格
export function getShopSkuTable(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_skuDetailTable",
    method: "post",
    data,
  })
}

// 店铺下的链接表格
export function getShopConnTable(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_linkTable",
    method: "post",
    data,
  })
}

// 链接spu表格
export function getConnSpuTable(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_spuDetailTable",
    method: "post",
    data,
  })
}

// 店铺趋势图
export function getShopTrend(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_storeTable_chart",
    method: "post",
    data,
  })
}

// 店铺下的链接趋势图 
export function getShopConnTrend(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_linkTable_chart",
    method: "post",
    data,
  })
}

// 链接spu趋势图
export function getConnSpuTrend(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_spuDetailTable_chart",
    method: "post",
    data,
  })
}

// 链接sku趋势图
export function getShopSkuTrend(data) {
  return request({
    url: "/server/deliverycenter/orderDetail_skuDetailTable_chart",
    method: "post",
    data,
  })
}

// 获取合计数据
export function getTotal(data) {
  return request({
    url: "/server/deliverycenter/total",
    method: "post",
    data,
  })
}