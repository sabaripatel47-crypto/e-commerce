import request from "@/utils/request";
//店铺表格分页列表
export function storePage(data) {
  return request({
    url: "/server/storeTable/storePage",
    method: "post",
    data: data,
  });
}

// 链接名称下拉框
export function linkPush(data) {
  return request({
    url: "/server/public/linkPush",
    method: "get",
    params: data,
  });
}
// 产品等级下拉框
export function greedPush(data) {
  return request({
    url: "/server/public/greedPush",
    method: "get",
    params: data,
  });
}

// sku下拉框
export function skuCodePush(data) {
  return request({
    url: "/server/sku_manage/skuCodePush",
    method: "get",
    params: data,
  });
}

//sku统计
export function linkPage(data) {
  return request({
    url: "/server/linkTable/linkPage",
    method: "post",
    data: data,
  });
}

//sku名称列表
export function skuCode() {
  return request({
    url: "/server/sku_manage/skuCode",
    method: "get",
  });
}

//sku下拉框-需要传入产品
export function skuPush(data) {
  return request({
    url: `/server/sku_manage/skuPush/${data}`,
    method: "get",
  });
}

//spu-spu统计--平台维度
export function spuStatistical(data) {
  return request({
    url: "/server/report_product/spuStatistical",
    method: "post",
    data: data,
  });
}

//动态标题
export function tableHander(data) {
  return request({
    url: "/server/tableHander",
    method: "post",
    data: data,
  });
}

//spu-sku统计--平台维度
export function skuStatistical(data) {
  return request({
    url: "/server/report_sku/skuStatistical",
    method: "post",
    data: data,
  });
}

// 店铺名称下拉框
export function listPush() {
  return request({
    url: "/server/store_manage/listPush",
    method: "get",
  });
}

// spu-链接统计--平台维度
export function linkStatistical(data) {
  return request({
    url: "/server/report_link/linkStatistical",
    method: "post",
    data: data,
  });
}

// sku-链接统计--平台维度
export function linkSkuStatistical(data) {
  return request({
    url: "/server/report_link/linkSkuStatistical",
    method: "post",
    data: data,
  });
}

// sku-sku统计--平台维度
export function statistical(data) {
  return request({
    url: "/server/report_sku/statistical",
    method: "post",
    data: data,
  });
}

// 趋势分析图--销售量--有同比环比
// export function quantityRate(data) {
//   return request({
//     url: "/server/report_product/quantityRate",
//     method: "post",
//     data: data,
//   });
// }

// 趋势分析图--退单量
export function refundNumber(data) {
  return request({
    url: "/server/report_product/refundNumber",
    method: "post",
    data: data,
  });
}

// 趋势分析图--退单量sku
export function refundNumberSku(data) {
  return request({
    url: "/server/report_sku/refundNumber",
    method: "post",
    data: data,
  });
}

// 趋势分析图--平均销量
export function averageRate(data) {
  return request({
    url: "/server/report_product/averageRate",
    method: "post",
    data: data,
  });
}

// 趋势分析图--平均销量
export function averageRateSku(data) {
  return request({
    url: "/server/report_sku/averageRate",
    method: "post",
    data: data,
  });
}

// 销售订单排行-销售金额排行榜-新的(spu)
export function orderRankingAmountNew(data) {
  return request({
    url: "/server/report_product/orderRankingAmountNew",
    method: "post",
    data: data,
  });
}

// 销售订单排行-销售数量排行榜-新的(spu)
export function orderRankingNumNew(data) {
  return request({
    url: "/server/report_product/orderRankingNumNew",
    method: "post",
    data: data,
  });
}
// 退款退货排行-销售数量-新的(spu)
export function refundRankingNumNew(data) {
  return request({
    url: "/server/report_product/refundRankingNumNew",
    method: "post",
    data: data,
  });
}

// 销售订单排行--新的(sku)
export function orderRankingAmountNewSku(data) {
  return request({
    url: "/server/report_sku/orderRankingAmountNew",
    method: "post",
    data: data,
  });
}

// 销售订单排行-销售数量排行榜--新的(sku)
export function orderRankingNumNewSku(data) {
  return request({
    url: "/server/report_sku/orderRankingNumNew",
    method: "post",
    data: data,
  });
}

// 退款退货排行--新的(sku)
export function refundRankingAmountSku(data) {
  return request({
    url: "/server/report_sku/refundRankingAmount",
    method: "post",
    data: data,
  });
}
// 退款退货排行-销售数量--新的(sku)
export function refundRankingNumNewSku(data) {
  return request({
    url: "/server/report_sku/refundRankingNumNew",
    method: "post",
    data: data,
  });
}

/* ------------------------------------------------------------- */

// 获取店铺明细列表
export function getStoreDetailList(data) {
  return request({
    url: "/server/storeTable/storeDetail",
    method: "post",
    data: data,
  });
}

// 获取商品链接明细列表
export function getLinkDetailList(data) {
  return request({
    url: "/server/linkTable/linkDetail",
    method: "post",
    data: data,
  });
}

// 获取商品链接-SKU明细列表
export function getLinkSkuDetailList(data) {
  return request({
    url: "/server/linkTable/linkSkuDetail",
    method: "post",
    data: data,
  });
}

// 获取商品链接-SPU明细列表
export function getLinkSpuDetailList(data) {
  return request({
    url: "/server/linkTable/linkSpuDetail",
    method: "post",
    data: data,
  });
}
