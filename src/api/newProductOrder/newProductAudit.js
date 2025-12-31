import request from '@/utils/request'

// 新品审核列表
export function newProductAuditList(data) {
  return request({
    url: '/server/newProducts/newProductsExamineAll',
    method: 'post',
    data
  })
}

// 新品审核待审核列表
export function newProductAuditWaitList(data) {
  return request({
    url: '/server/newProducts/newProductsExamine',
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

// 新品审核通过
export function newProductAuditPass(data) {
  return request({
    url: '/server/newProducts/purchaseConfirm',
    method: 'post',
    data
  })
}

// 新品审核不通过
export function newProductAuditNoPass(data) {
  return request({
    url: '/server/newProducts/purchaseCancel',
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