import request from "@/utils/request";

// sku折线趋势图
export function getLineChart(skuUuid) {
  return request({
    url: `/server/purchase/getLineChart/${skuUuid}`,
    method: "get",
  });
}

// sku趋势图表格数据
export function getTrendTable(skuUuid) {
  return request({
    url: `/server/purchase/getTrendTable/${skuUuid}`,
    method: "get",
  });
}

// sku趋势图复核表格数据
export function getSupportTrendTable(skuUuid) {
  return request({
    url: `/server/purchase/getSupportTrendTable/${skuUuid}`,
    method: "get",
  });
}

// sku趋势图信息
export function getTrendInfo(data) {
  return request({
    url: `/server/operation/getTrendInfo`,
    method: "post",
    data,
  });
}

// spu折线趋势图
export function getSpuLineChart(spuUuid) {
  return request({
    url: `/server/movement/spu_movement/chart/${spuUuid}`,
    method: "get",
  });
}

// spu趋势图表格数据
export function getSpuTrendTable(spuUuid) {
  return request({
    url: `/server/movement/spu_movement/getTrendTable/${spuUuid}`,
    method: "get",
  });
}

// 仓库记录
export function warehouseInventoryList(id) {
  return request({
    url: `/server/local_stock/record/List?skuUuid=${id}`,
    method: "get",
  });
}

// 货品分类下拉框
export function categoryList() {
  return request({
    url: "/server/public/tree/category",
    method: "get",
  });
}
