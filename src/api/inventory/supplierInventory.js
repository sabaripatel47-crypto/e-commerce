import request from "@/utils/request";
import { listKeyData } from "@/api/system/dict/data";
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

// 供应商分页列表
export function supplierInventoryList(data) {
  return request({
    url: `/server/stock_supplier/page`,
    method: "post",
    data,
  });
}

// 供应商修改记录分页列表
export function supplierInventoryRecordList(data) {
  return request({
    url: `/server/stock_supplier/record/page`,
    method: "post",
    data,
  });
}

// 修改类型下拉
export function getChangeTypeList() {
  return request({
    url: `/server/stock_supplier/update_type`,
    method: "get",
  });
}

// 退货
export function returnGoods(data) {
  return request({
    url: `/server/stock_supplier/return_goods`,
    method: "post",
    data,
  });
}

// 换货
export function exchangeGoods(data) {
  return request({
    url: `/server/stock_supplier/exchange_goods`,
    method: "post",
    data,
  });
}

// 退货详情
export function returnGoodsDetail(data) {
  return request({
    url: `/server/stock_supplier/return_details`,
    method: "post",
    data: data,
  });
}

// // 换货详情
// export function exchangeGoodsDetail(data) {
//   return request({
//     url: `/server/stock_supplier/return_details`,
//     method: "post",
//     data:data
//   });
// }

// 退货原因列表
export function listPlatform() {
  return listKeyData("ofld_refund_reason");
}

// sku编码下拉框
export function getSkuCodeList(data) {
  return request({
    url: `/server/stock_supplier/sku_list`,
    method: "post",
    data: data,
  });
}

// 根据skuUuid获取图片地址
export function getImgUrl(data) {
  return request({
    url: `/server/stock_supplier/sku_image`,
    method: "post",
    data: data,
  });
}
