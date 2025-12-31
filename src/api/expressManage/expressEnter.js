import request from "@/utils/request";

// 获取订单列表
export function getExpressList(data) {
  return request({
    url: "/server/express/courier_list",
    method: "post",
    data: data,
  });
}

// 获取状态下拉框数据
export function getStatusList() {
  return request({
    url: "/server/express/courier_status",
    method: "get",
  });
}

// 录入快递单号
export function addExpressList(data) {
  return request({
    url: "/server/express/courier_add",
    method: "post",
    data: data,
  });
}

// 删除快递单
export function deleteExpress(data) {
  return request({
    url: "/server/express/courier_delete",
    method: "delete",
    data: data,
  });
}

// 确认快递单 
export function affirmExpress(data) {
  return request({
    url: "/server/express/courier_affirm",
    method: "post",
    data: data,
  });
}
