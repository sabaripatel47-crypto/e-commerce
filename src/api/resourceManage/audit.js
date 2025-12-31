import request from '@/utils/request'

// 店铺下拉
export function getShopList() {
  return request({
    url: '/server/store_manage/listPushByManage',
    method: 'get'
  })
}

// 等级下拉
export function getLevelList() {
  return request({
    url: '/server/public/linkPush',
    method: 'get'
  })
}

// 商品链接下拉
export function storeToLinkPush(data) {
  return request({
    url: '/server/link_manage/storeToLinkPush',
    method: 'post',
    data
  })
}

// 状态下拉
export function linkApplyType() {
  return request({
    url: '/server/public/linkApplyType',
    method: 'get',
  })
  
}

// 申请分页
export function getauditList(data) {
  return request({
    url: '/server/linkApply/applyPage',
    method: 'post',
    data
  })
}

// 商品详情
export function linkDetail(uuid) {
  return request({
    url: `/server/linkApply/details/${uuid}`,
    method: 'get',
  })
}

// 申请作废
export function applyCancel(data) {
  return request({
    url: '/server/linkApply/cancel',
    method: 'post',
    data
  })
}

// 申请驳回
export function applyReject(data) {
  return request({
    url: '/server/linkApply/reject',
    method: 'post',
    data
  })
}

// 申请通过
export function applyPass(data) {
  return request({
    url: '/server/linkApply/confirmed',
    method: 'post',
    data
  })
}