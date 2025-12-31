import request from "@/utils/request";

// 出库管理数据列表
export function getOutboundList(data) {
  return request({
    url: "/server/goods/outbound/page",
    method: "post",
    data,
  });
}

// 新增出库
export function addOutbound(data) {
  return request({
    url: "/server/goods/outbound/add",
    method: "post",
    data,
  });
}

// 出库详情
export function outboundDetail(id) {
  return request({
    url: `/server/goods/outbound/update/${id}`,
    method: "get",
  });
}

// 修改出库
export function editOutbound(data) {
  return request({
    url: `/server/goods/outbound/update`,
    method: "put",
    data,
  });
}
