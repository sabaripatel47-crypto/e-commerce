import request from "@/utils/request";

// 审核状态下拉框
export function getAuditStatus() {
  return request({
    url: "/server/public/examinePurchasePush",
    method: "get",
  });
}

// 供应商下拉
export function getSupplierList() {
  return request({
    url: `/server/supplier_home/list`,
    method: "get",
  });
}

// 产品名称下拉
export function listSpuName() {
  return request({
    url: `/server/product_manage/spuPush`,
    method: "get",
  });
}

// SKU下拉
export function skuCodeToProductCode(spuUuid) {
  return request({
    url: `/server/sku_manage/skuPush/${spuUuid}`,
    method: "get",
  });
}
