import request from "@/utils/request";

//  采购审核列表全部
export function purchaseAuditList(data) {
  return request({
    url: "/server/purchase/purchaseOwnPage",
    method: "post",
    data,
  });
}

// 采购审核列表待审核
export function purchaseAuditListPending(data) {
  return request({
    url: "/server/purchase/purchaseWaitExaminePage",
    method: "post",
    data,
  });
}

// 采购驳回

export function purchaseReject(data) {
  return request({
    url: "/server/purchase/purchaseCancel",
    method: "post",
    data,
  });
}

// 采购通过
export function purchasePass(data) {
  return request({
    url: "/server/purchase/purchaseConfirm",
    method: "post",
    data,
  });
}

// 采购详情
export function purchaseDetail(data) {
  return request({
    url: "/server/purchase/purchaseDetail",
    method: "post",
    data,
  });
}

// 子集详情
export function purchaseChildDetail(data) {
  return request({
    url: "/server/purchase/purchaseReviewDetail",
    method: "post",
    data,
  });
}

// 状态下拉
export function getPurchaseStatus() {
  return request({
    url: "/server/public/statusPurchasePush",
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
