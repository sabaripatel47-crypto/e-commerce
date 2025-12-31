import request from '@/utils/request'

// 提交状态下拉
export function getSubmitStatus() {
  return request({
    url: '/server/public/submitTypePush',
    method: 'get'
  })
}
 
// 审核状态下拉框
export function getAuditStatus() {
  return request({
    url: '/server/public/examinePurchasePush',
    method: 'get'
  })
}

// 新品下单全部
export function newOrderRecordList(data) {
  return request({
    url: '/server/newProducts/newProductsReview',
    method: 'post',
    data
  })
}

// 新品下单我的驳回
export function newOrderRecordReject(data) {
  return request({
    url: '/server/newProducts/newProductsRejectReview',
    method: 'post',
    data
  })
}

// 新品下单详情
export function newOrderRecordDetail(data) {
  return request({
    url: '/server/newProducts/purchaseDetail',
    method: 'post',
    data
  })
}

// 新品下单子集详情
export function newOrderRecordDetailChild(data) {
  return request({
    url: '/server/newProducts/newProductsSonList',
    method: 'post',
    data
  })
}

// 新品下单修改
export function getNewOrderDetail(id) {
  return request({
    url: `/server/newProducts/newProductsReviewUpdate/${id}`,
    method: 'get',
  })
}