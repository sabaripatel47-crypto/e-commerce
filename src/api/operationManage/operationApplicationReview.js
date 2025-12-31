import request from "@/utils/request";

// 获取全部列表
export function getAllList(data) {
  return request({
    url: "/server/operation/operationExaminePage",
    method: "post",
    data: data,
  });
}

// 获取待处理列表
export function getPendingList(data) {
  return request({
    url: "/server/operation/operationExamineTodoPage",
    method: "post",
    data: data,
  });
}

// 通过审核
export function passAudit(operationUuid) {
  return request({
    url: `/server/operation/getConfirm/${operationUuid}`,
    method: "get",
  });
}

// 驳回审核
export function rejectAudit(data) {
  return request({
    url: "/server/operation/getReject",
    method: "post",
    data: data,
  });
}


