import request from "@/utils/request";

// 申请类型下拉
export function getApplyType() {
  return request({
    url: "/server/public/applyTypePush",
    method: "get",
  });
}

// 货品分类列表

// 供应商列表
export function getSupplierList() {
  return request({
    url: "/server/supplier_home/list",
    method: "get",
  });
}

// 产品名称列表
export function getProductNameList() {
  return request({
    url: "/server/product_manage/productName",
    method: "get",
  });
}

// SKU列表
export function getSkuList(id) {
  return request({
    url: `/server/sku_manage/skuPush/${id}`,
    method: "get",
  });
}

// 采购列表
export function getPurchaseList(data) {
  return request({
    url: "/server/purchase/purchaseOrderList",
    method: "post",
    data,
  });
}

// 采购下单
export function purchaseOrder(data) {
  return request({
    url: "/server/purchase/purchaseOrderAdd",
    method: "post",
    data,
  });
}

// 根据sku获取信息
// export function getSkuInfo(id) {
//   return request({
//     url: `/server/purchase/getSkuDetail/${id}`,
//     method: "post",
//   });
// }
export function getSkuInfo(data) {
return request({
    url: "/server/purchase/getSkuDetail",
    method: "post",
    data,
})
}

// sku下拉框
export function getSkuListPush(data) {
  return request({
    url: "/server/public/purchaseToSkulist",
    method: "post",
    data,
  });
}

// 自动生成采购计划
export function autoPurchase(purchase) {
  return request({
    url: `/server/purchase/procurementPlans/${purchase}`,
    method: "get",
  });
}

// 生成余下采购计划
export function autoPurchaseRest(purchase) {
  return request({
    url: `/server/purchase/procurementreMainPlans/${purchase}`,
    method: "get",
  });
}

// 运营计划详情
export function getPurchaseDetail(data) {
  return request({
    url: "/server/purchase/operationDetail",
    method: "post",
    data,
  });
}

// 运营计划详情(采购看板用)
export function getPurchaseDetailForBoard(data) {
  return request({
    url: "/server/ofld/operationDetail",
    method: "post",
    data,
  });
}

// 根据skuUuid数组获取详情
export function getPurchaseDetailBySku(data) {
  return request({
    url: "/server/purchase/getPurchaseList",
    method: "post",
    data,
  });
}

export function category(data) {
  return request({
    url: "/server/strategy/statistics/tree/category",
    method: "get",
    params: data,
  });
}

// 获取供应商库存数据
export function getSupplierStockList(data) {
  return request({
    url: `/server/ofld/getSupplierStockNum`,
    method: "post",
    data,
  });
}

// 获取生产周期数据
export function getProductionCycleList(data) {
  return request({
    url: `/server/newProducts/getSupplierProductTime`,
    method: "post",
    data,
  });
}

// 趋势图接口已迁移到 @/api/purchasingManagement/common.js
// 请使用: import { getTrendTable } from '@/api/purchasingManagement/common'
