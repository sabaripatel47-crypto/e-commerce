import request from "@/utils/request";

// 获取所有发起的流程列表
export function getList(query) {
  return request({
    url: "/server/query/user/audit",
    method: "get",
    params: query,
  });
}

// 发起流程
export function submitFlow(data) {
  return request({
    url: "/server/every/user/add",
    method: "post",
    data,
  });
}

// 撤回流程
export function recallFlow(id) {
  return request({
    url: `/server/every/user/recall/${id}`,
    method: "get",
  });
}

// 删除流程
export function deleteFlow(id) {
  return request({
    url: `/server/every/user/delete/${id}`,
    method: "get",
  });
}

// 流程审批状态详情
export function getFlowDetail(id) {
  return request({
    url: `/server/query/user/selectById/${id}`,
    method: "get",
  });
}
