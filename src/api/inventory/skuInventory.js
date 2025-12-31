import request from "@/utils/request";

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

// 修改类型下拉
export function getChangeTypeList() {
  return request({
    url: `/server/stock_supplier/update_type`,
    method: "get",
  });
}

// sku分页列表
export function skuInventoryList(data) {
  return request({
    url: "/server/local_stock/sku/page",
    method: "post",
    data,
  });
}

// 供应商记录
export function supplierInventoryList(id) {
  return request({
    url: `/server/stock_supplier/supplier/record?skuUuid=${id}`,
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

// 仓库修改记录
export function warehouseRecordList(data) {
  return request({
    url: "/server/local_stock/record/page",
    method: "post",
    data,
  });
}
// 仓库修改记录(父级)
export function warehouseRecordParentList(data) {
  return request({
    url: "/server/local_stock/record/parent_page",
    method: "post",
    data,
  });
}

// 供应商修改记录
export function supplierRecordList(data) {
  return request({
    url: "/server/stock_supplier/record/page",
    method: "post",
    data,
  });
}

// 供应商修改记录(父级)
export function supplierRecordParentList(data) {
  return request({
    url: "/server/stock_supplier/record/parent_page",
    method: "post",
    data,
  });
}

// 获取最新更新时间
export function getUpdateTime() {
  return request({
    url: "/server/local_stock/updateTime",
    method: "post",
  });
}
