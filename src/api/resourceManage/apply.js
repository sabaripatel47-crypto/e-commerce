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

// 申请分页
export function getApplyList(data) {
  return request({
    url: '/server/linkApply/applyPage',
    method: 'post',
    data
  })
}

// 新增
export function addApply(data) {
  return request({
    url: '/server/linkApply/add',
    method: 'post',
    data
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

// 申请修改
export function applyEdit(data) {
  return request({
    url: '/server/linkApply/update',
    method: 'put',
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