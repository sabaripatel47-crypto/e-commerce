import request from "@/utils/request";

// 订单管理数据列表
export function getOrderList(params) {
  return request({
    url: "/server/order/list",
    method: "get",
    params,
  });
}

// 新增订单
export function addOrder(data) {
  return request({
    url: "/server/order/add",
    method: "post",
    data,
  });
}

// 订单详情
export function orderDetail(id) {
  return request({
    url: `/server/order/${id}`,
    method: "get",
  });
}

// 修改订单
export function editOrder(data) {
  return request({
    url: `/server/order/edit`,
    method: "post",
    data,
  });
}

// 删除订单
export function deleteOrder(ids) {
  return request({
    url: `/server/order/delete/${ids}`,
    method: "post",
  });
}
