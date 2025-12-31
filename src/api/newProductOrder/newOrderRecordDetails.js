import request from '@/utils/request'

// sku下拉框
export function getSkuListPush(data) {
  return request({
    url: '/server/public/purchaseToSkulist',
    method: 'post',
    data
  })
}
// 根据sku获取信息
// export function getSkuInfo(id) {
//   return request({
//     url: `/server/purchase/getSkuDetail/${id}`,
//     method: 'post'
//   })
// }
export function getSkuInfo(data){
return request({
    url: '/server/purchase/getSkuDetail',
    method: 'post',
    data
})
}

// 新品下单新增
export function newOrderSubmit(data) {
  return request({
    url: '/server/newProducts/add',
    method: 'post',
    data
  })
}

// 新品下单修改
export function newOrderEdit(data) {
  return request({
    url: '/server/newProducts/Update',
    method: 'put',
    data
  })
}

// 修改暂存
export function newOrderEditTemp(data) {
  return request({
    url: '/server/newProducts/updateStating',
    method: 'put',
    data
  })
}

// 新品下单重新发起
export function newOrderReSubmit(data) {
  return request({
    url: '/server/newProducts/reissue',
    method: 'put',
    data
  })
}

// 新品下单暂存
export function newOrderTemp(data) {
  return request({
    url: '/server/newProducts/staging',
    method: 'post',
    data
  })
}