import request from "@/utils/request";

// 采购状态下拉框
// /server/purchase/statusPurchasePush
export function getPurchaseStatus() {
  return request({
    url: "/server/public/statusPurchasePush",
    method: "get",
  });
}

// 审核状态下拉框
export function getAuditStatus() {
  return request({
    url: "/server/public/examinePurchasePush",
    method: "get",
  });
}

// 采购记录列表全部
export function purchaseReviewOwnPage(data) {
  return request({
    url: "/server/purchase/purchaseReviewOwnPage",
    method: "post",
    data,
  });
}

// 采购记录列表我的驳回
export function purchaseReviewOwnRejectPage(data) {
  return request({
    url: "/server/purchase/purchaseReviewOwnRejectPage",
    method: "post",
    data,
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

// 子表
export function purchaseReviewDetail(data) {
  return request({
    url: `/server/purchase/purchaseReviewDetail`,
    method: "post",
    data,
  });
}

// 修改详情
export function purchaseReviewUpdate(data) {
  return request({
    url: `/server/purchase/purchaseReviewUpdate`,
    method: "post",
    data,
  });
}

// 修改提交
export function purchaseReviewSubmit(data) {
  return request({
    url: `/server/purchase/Update`,
    method: "put",
    data,
  });
}

// 重新发起
export function purchaseReviewReSubmit(data) {
  return request({
    url: `/server/purchase/reissue`,
    method: "put",
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

// 提交状态下拉
export function getSubmitStatus() {
  return request({
    url: "/server/public/submitTypePush",
    method: "get",
  });
}

// 修改暂存
export function purchaseReviewUpdateTemp(data) {
  return request({
    url: "/server/purchase/updateStating",
    method: "PUT",
    data,
  });
}
